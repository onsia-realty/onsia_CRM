import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createVisitSchema = z.object({
  customerId: z.string(),
  assigneeId: z.string(),
  date: z.string().transform((str) => new Date(str)),
  note: z.string().optional(),
});

const updateVisitStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CHECKED', 'NO_SHOW']),
});

// GET /api/visits - 방문 일정 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const assigneeId = searchParams.get('assigneeId');

    const where = {
      ...(start && end && {
        date: {
          gte: new Date(start),
          lte: new Date(end),
        },
      }),
      ...(assigneeId && { assigneeId }),
      ...(session.user.role === 'EMPLOYEE' && { assigneeId: session.user.id }),
    };

    const visits = await prisma.visit.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    // FullCalendar 형식으로 변환
    const events = visits.map((visit) => ({
      id: visit.id,
      title: `${visit.customer.name} - 방문`,
      start: visit.date.toISOString(),
      customerId: visit.customerId,
      customerName: visit.customer.name || '이름 없음',
      assigneeName: visit.assignee.name,
      note: visit.note,
      status: visit.status,
    }));

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Failed to fetch visits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}

// POST /api/visits - 방문 일정 생성
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createVisitSchema.parse(body);

    const visit = await prisma.visit.create({
      data: validatedData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error('Failed to create visit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create visit' },
      { status: 500 }
    );
  }
}

// PATCH /api/visits - 방문 일정 상태 업데이트
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Visit ID is required' },
        { status: 400 }
      );
    }

    const validatedData = updateVisitStatusSchema.parse(updateData);

    const visit = await prisma.visit.update({
      where: { id },
      data: validatedData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error('Failed to update visit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update visit' },
      { status: 500 }
    );
  }
}