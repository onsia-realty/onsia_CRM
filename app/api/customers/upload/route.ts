import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/utils/phone';
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/utils/audit';
import * as XLSX from 'xlsx';

interface ExcelCustomer {
  name?: string;
  phone?: string;
  gender?: string;
  ageRange?: string;
  residenceArea?: string;
  familyRelation?: string;
  occupation?: string;
  investHabit?: string;
  expectedBudget?: number;
  ownAssets?: string;
  lastVisitMH?: string;
  notes?: string;
  source?: string;
  assigneeEmail?: string;
}

// POST /api/customers/upload - 엑셀 파일로 고객 대량 등록
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ADMIN 또는 HEAD만 대량 업로드 가능
    if (!['ADMIN', 'HEAD'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: 'Only Excel files (.xlsx, .xls) are allowed' },
        { status: 400 }
      );
    }

    // 파일을 ArrayBuffer로 읽기
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 첫 번째 시트 읽기
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelCustomer[];

    if (jsonData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    // 데이터 유효성 검사 및 변환
    const validCustomers: any[] = [];
    const errors: string[] = [];
    const duplicatePhones: string[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2; // Excel 행 번호 (헤더 제외)

      // 필수 필드 검증
      if (!row.phone) {
        errors.push(`행 ${rowNum}: 전화번호가 필요합니다`);
        continue;
      }

      const normalizedPhone = normalizePhone(row.phone);
      if (!normalizedPhone) {
        errors.push(`행 ${rowNum}: 유효하지 않은 전화번호입니다`);
        continue;
      }

      // 중복 전화번호 체크
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone },
      });

      if (existingCustomer) {
        duplicatePhones.push(`행 ${rowNum}: ${row.phone} (이미 등록됨)`);
        continue;
      }

      // 담당자 찾기 (이메일로)
      let assigneeId = session.user.id;
      if (row.assigneeEmail) {
        const assignee = await prisma.user.findUnique({
          where: { email: row.assigneeEmail },
        });
        if (assignee) {
          assigneeId = assignee.id;
        } else {
          errors.push(`행 ${rowNum}: 담당자 이메일을 찾을 수 없습니다 (${row.assigneeEmail})`);
          continue;
        }
      }

      validCustomers.push({
        name: row.name || null,
        phone: normalizedPhone,
        gender: row.gender || null,
        ageRange: row.ageRange || null,
        residenceArea: row.residenceArea || null,
        familyRelation: row.familyRelation || null,
        occupation: row.occupation || null,
        investHabit: row.investHabit || null,
        expectedBudget: row.expectedBudget ? Number(row.expectedBudget) : null,
        ownAssets: row.ownAssets || null,
        lastVisitMH: row.lastVisitMH || null,
        notes: row.notes || null,
        source: row.source || '엑셀 업로드',
        createdById: assigneeId,
      });
    }

    // 에러가 있으면 업로드 중단
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation errors found',
        details: {
          errors,
          duplicatePhones,
          validCount: validCustomers.length,
          totalCount: jsonData.length,
        },
      }, { status: 400 });
    }

    // 트랜잭션으로 대량 생성
    const result = await prisma.$transaction(async (tx) => {
      const createdCustomers = await tx.customer.createMany({
        data: validCustomers,
        skipDuplicates: true,
      });

      // 감사 로그
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BULK_UPLOAD',
          entity: 'Customer',
          changes: {
            fileName: file.name,
            uploadCount: createdCustomers.count,
            totalRows: jsonData.length,
          },
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
        },
      });

      return createdCustomers;
    });

    return NextResponse.json({
      success: true,
      data: {
        uploadedCount: result.count,
        totalRows: jsonData.length,
        duplicatePhones: duplicatePhones.length > 0 ? duplicatePhones : undefined,
      },
    });

  } catch (error) {
    console.error('Failed to upload customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}

// GET /api/customers/upload/template - 엑셀 템플릿 다운로드
export async function GET() {
  try {
    // 샘플 데이터로 템플릿 생성
    const templateData = [
      {
        name: '김철수',
        phone: '010-1234-5678',
        gender: '남성',
        ageRange: '40대',
        residenceArea: '강남구',
        familyRelation: '4인 가족',
        occupation: '회사원',
        investHabit: '시세차익',
        expectedBudget: 100000000,
        ownAssets: '아파트 1채',
        lastVisitMH: '래미안 원베일리',
        notes: 'VIP 고객',
        source: '소개',
        assigneeEmail: 'employee@onsia.local',
      },
      {
        name: '이영희',
        phone: '010-2345-6789',
        gender: '여성',
        ageRange: '30대',
        residenceArea: '서초구',
        familyRelation: '신혼부부',
        occupation: '전문직',
        investHabit: '실거주',
        expectedBudget: 80000000,
        ownAssets: '없음',
        lastVisitMH: '힐스테이트',
        notes: '첫 주택 구매',
        source: '광고',
        assigneeEmail: 'leader@onsia.local',
      },
    ];

    // Excel 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // 컬럼 너비 설정
    const colWidths = [
      { wch: 10 }, // name
      { wch: 15 }, // phone
      { wch: 8 },  // gender
      { wch: 8 },  // ageRange
      { wch: 12 }, // residenceArea
      { wch: 12 }, // familyRelation
      { wch: 10 }, // occupation
      { wch: 10 }, // investHabit
      { wch: 15 }, // expectedBudget
      { wch: 15 }, // ownAssets
      { wch: 15 }, // lastVisitMH
      { wch: 20 }, // notes
      { wch: 10 }, // source
      { wch: 20 }, // assigneeEmail
    ];

    worksheet['!cols'] = colWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '고객 데이터');

    // Excel 파일을 버퍼로 변환
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', 'attachment; filename="customer_template.xlsx"');

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Failed to generate template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}