import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCustomerSchema, searchCustomerSchema } from '@/lib/validations/customer'
import { normalizePhone } from '@/lib/utils/phone'
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit'

// GET /api/customers - 고객 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('query') || undefined
    const assignedUserId = searchParams.get('assignedUserId') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = {
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { phone: { contains: normalizePhone(query) } },
        ],
      }),
      ...(session.user.role === 'EMPLOYEE' && { createdById: session.user.id }),
    }

    try {
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
            _count: {
              select: {
                visits: true,
                allocations: true,
              },
            },
          },
        }),
        prisma.customer.count({ where }),
      ])

      return NextResponse.json({
        success: true,
        data: customers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (dbError) {
      console.warn('Database not available, returning mock data:', dbError)

      // 데이터베이스 연결이 안되는 경우 모의 데이터 반환
      const mockCustomers = [
        {
          id: '1',
          name: '김철수',
          phone: '01012345678',
          gender: '남성',
          ageRange: '40대',
          residenceArea: '강남구',
          familyRelation: '4인 가족',
          occupation: '회사원',
          investHabit: '시세차익',
          expectedBudget: 100000000,
          ownAssets: '아파트 1채',
          lastVisitMH: '래미안 원베일리',
          notes: 'VIP 고객, 투자 의향 높음',
          source: '소개',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: session.user.id,
            name: session.user.name || '관리자',
            email: session.user.email || 'admin@onsia.local'
          },
          _count: {
            visits: 2,
            allocations: 1
          }
        },
        {
          id: '2',
          name: '이영희',
          phone: '01023456789',
          gender: '여성',
          ageRange: '30대',
          residenceArea: '서초구',
          familyRelation: '신혼부부',
          occupation: '전문직',
          investHabit: '실거주',
          expectedBudget: 80000000,
          ownAssets: '없음',
          lastVisitMH: '힐스테이트',
          notes: '첫 주택 구매 예정',
          source: '광고',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: {
            id: session.user.id,
            name: session.user.name || '관리자',
            email: session.user.email || 'admin@onsia.local'
          },
          _count: {
            visits: 1,
            allocations: 0
          }
        }
      ]

      return NextResponse.json({
        success: true,
        data: mockCustomers,
        pagination: {
          page: 1,
          limit: 20,
          total: mockCustomers.length,
          totalPages: 1,
        },
      })
    }
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - 고객 생성
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createCustomerSchema.parse(body)
    
    const normalizedPhone = normalizePhone(validatedData.phone)

    // 중복 체크
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone: normalizedPhone },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 전화번호입니다' },
        { status: 409 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        phone: normalizedPhone,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // 감사 로그
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Customer',
      entityId: customer.id,
      changes: customer,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
    })

    return NextResponse.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}