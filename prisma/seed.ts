import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 기본 팀 생성
  const team1 = await prisma.team.create({
    data: {
      name: '1본부-1팀',
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: '1본부-2팀',
    },
  });

  console.log('✅ 팀 생성 완료');

  // Admin 계정 생성
  const adminPassword = await bcrypt.hash('Admin!234', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@onsia.local',
      name: '관리자',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      approved: true,
    },
  });

  console.log('✅ 관리자 계정 생성 완료');

  // 직원 계정 생성 (승인 대기)
  const employeePassword = await bcrypt.hash('Test!234', 10);
  const pendingEmployee = await prisma.user.create({
    data: {
      email: 'employee1@onsia.local',
      name: '김직원',
      passwordHash: employeePassword,
      role: Role.EMPLOYEE,
      approved: false, // 승인 대기
      teamId: team1.id,
    },
  });

  // 승인된 직원 계정
  const approvedEmployee = await prisma.user.create({
    data: {
      email: 'employee2@onsia.local',
      name: '박직원',
      passwordHash: employeePassword,
      role: Role.EMPLOYEE,
      approved: true,
      teamId: team1.id,
    },
  });

  // 팀장 계정
  const leader = await prisma.user.create({
    data: {
      email: 'leader@onsia.local',
      name: '이팀장',
      passwordHash: employeePassword,
      role: Role.LEADER,
      approved: true,
      teamId: team1.id,
    },
  });

  console.log('✅ 직원 계정 생성 완료');

  // 공지사항 생성
  await prisma.announcement.createMany({
    data: [
      {
        title: '🎉 온시아 CRM 시스템 오픈',
        content: `# 온시아 CRM 시스템이 오픈되었습니다!

안녕하세요, 온시아 가족 여러분!

새로운 CRM 시스템이 정식으로 오픈되었음을 알려드립니다.

## 주요 기능
- **고객 관리**: 체계적인 고객 정보 관리
- **방문 일정**: 효율적인 일정 관리
- **성과 분석**: 실시간 성과 확인

모든 직원분들은 회원가입 후 관리자 승인을 받아 시스템을 이용하실 수 있습니다.

감사합니다.`,
        pinned: true,
        authorId: admin.id,
      },
      {
        title: '📋 시스템 사용 가이드',
        content: `## CRM 시스템 사용 안내

### 1. 로그인
- 회원가입 후 관리자 승인 대기
- 승인 완료 시 이메일 안내

### 2. 고객 등록
- 상단 메뉴 > 고객 관리 > 신규 고객
- 필수 정보 입력 후 저장

### 3. 방문 일정
- 캘린더에서 일정 확인
- 방문 완료 시 체크 표시

문의사항은 관리팀으로 연락 바랍니다.`,
        pinned: false,
        authorId: admin.id,
      },
    ],
  });

  console.log('✅ 공지사항 생성 완료');

  // 샘플 고객 데이터 생성
  const customers = await prisma.customer.createMany({
    data: [
      {
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
        createdById: approvedEmployee.id,
      },
      {
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
        createdById: approvedEmployee.id,
      },
      {
        name: '박민수',
        phone: '01034567890',
        gender: '남성',
        ageRange: '50대',
        residenceArea: '송파구',
        familyRelation: '3인 가족',
        occupation: '자영업',
        investHabit: '월수익',
        expectedBudget: 150000000,
        ownAssets: '상가 2개',
        lastVisitMH: '아크로리버파크',
        notes: '임대 수익 관심',
        source: 'TM',
        createdById: leader.id,
      },
    ],
  });

  console.log('✅ 샘플 고객 데이터 생성 완료');

  // 방문 일정 생성
  const customerList = await prisma.customer.findMany();
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  await prisma.visit.createMany({
    data: [
      {
        customerId: customerList[0].id,
        assigneeId: approvedEmployee.id,
        date: tomorrow,
        status: 'SCHEDULED',
        note: '래미안 원베일리 모델하우스 방문',
      },
      {
        customerId: customerList[1].id,
        assigneeId: approvedEmployee.id,
        date: today,
        status: 'CHECKED',
        note: '계약 상담 완료',
      },
    ],
  });

  console.log('✅ 방문 일정 생성 완료');

  console.log('✨ 시드 데이터 생성이 완료되었습니다!');
  console.log('\n📌 테스트 계정 정보:');
  console.log('관리자: admin@onsia.local / Admin!234');
  console.log('직원(승인됨): employee2@onsia.local / Test!234');
  console.log('팀장: leader@onsia.local / Test!234');
  console.log('직원(승인대기): employee1@onsia.local / Test!234');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });