# 온시아 CRM - 부동산 고객관리 시스템

온시아 부동산의 체계적인 고객 관리를 위한 CRM 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 인증 및 권한 관리
- NextAuth v5 기반 로그인/회원가입
- 역할 기반 권한 제어 (EMPLOYEE, LEADER, HEAD, ADMIN)
- 관리자 승인 시스템

### 👥 고객 관리
- 온시아 고객관리카드 기반 상세 정보 입력
- 전화번호 정규화 및 중복 검증
- 검색 및 필터링
- 엑셀 파일 대량 업로드

### 📅 방문 일정 관리
- FullCalendar 기반 월간 캘린더 뷰
- 방문 상태 관리 (예정/완료/노쇼)
- 실시간 체크율 계산

### 📢 공지사항
- Markdown 지원 공지사항 작성
- 고정 공지사항 기능
- 역할별 작성 권한

### 📊 엑셀 지원
- 고객 데이터 엑셀 템플릿 다운로드
- 대량 고객 등록
- 중복 데이터 감지 및 처리

### 🔍 감사 로그
- 모든 주요 작업 기록
- 사용자별 활동 추적

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth v5
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **Excel**: SheetJS (xlsx)
- **Validation**: Zod
- **Testing**: Vitest, Playwright

## 🚀 시작하기

### 환경 요구사항
- Node.js 18+
- PostgreSQL 데이터베이스

### 1. 저장소 클론
```bash
git clone <repository-url>
cd onsia_CRM
```

### 2. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

### 3. 환경변수 설정
`.env.sample`을 복사하여 `.env.local`을 생성하고 값을 설정합니다:

```bash
cp .env.sample .env.local
```

필수 환경변수:
```env
# NextAuth
AUTH_SECRET=your-auth-secret-here-generate-with-openssl-rand-base64-32

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/onsia_crm?schema=public"

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000
```

### 4. 데이터베이스 설정
```bash
# 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 생성 (테스트 계정 포함)
npx prisma db seed
```

### 5. 개발 서버 실행
```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 🧪 테스트

### 단위 테스트 (Vitest)
```bash
npm run test
npm run test:ui  # UI 모드
```

### E2E 테스트 (Playwright)
```bash
npm run test:e2e
npm run test:e2e:ui  # UI 모드
```

## 📦 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경변수 설정:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
   - `AUTH_SECRET`: 인증 비밀키
   - `NEXTAUTH_URL`: 배포된 도메인 URL
3. 자동 배포 완료

### 수동 빌드
```bash
npm run build
npm start
```

## 🔑 기본 계정 정보

시드 데이터 실행 후 다음 계정들이 생성됩니다:

| 역할 | 이메일 | 비밀번호 | 상태 |
|------|--------|----------|------|
| 관리자 | admin@onsia.local | Admin!234 | 승인됨 |
| 팀장 | leader@onsia.local | Test!234 | 승인됨 |
| 직원 | employee2@onsia.local | Test!234 | 승인됨 |
| 직원 | employee1@onsia.local | Test!234 | 승인대기 |

## 📋 주요 페이지

- `/auth/signin` - 로그인
- `/auth/signup` - 회원가입
- `/dashboard` - 메인 대시보드
- `/dashboard/customers` - 고객 관리
- `/dashboard/customers/new` - 신규 고객 등록
- `/dashboard/customers/bulk-import` - 엑셀 대량 등록
- `/dashboard/schedules` - 방문 일정 (캘린더)
- `/dashboard/notices` - 공지사항
- `/admin/users` - 사용자 승인 관리 (관리자만)

## 🗂 프로젝트 구조

```
onsia_CRM/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드 페이지
│   └── admin/             # 관리자 페이지
├── components/            # 재사용 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── calendar/         # 캘린더 컴포넌트
│   └── dashboard/        # 대시보드 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts           # NextAuth 설정
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── utils/            # 유틸리티 함수
│   └── validations/      # Zod 스키마
├── prisma/               # 데이터베이스 스키마
├── test/                 # 단위 테스트
├── e2e/                  # E2E 테스트
└── public/               # 정적 파일
```

## 🔧 개발 가이드

### 데이터베이스 스키마 변경
```bash
# 스키마 수정 후 마이그레이션 생성
npx prisma migrate dev --name "변경사항_설명"

# Prisma 클라이언트 재생성
npx prisma generate
```

### 새로운 컴포넌트 추가
```bash
# shadcn/ui 컴포넌트 추가
npx shadcn-ui@latest add <component-name>
```

### 환경별 설정
- 개발: `.env.local`
- 스테이징: Vercel 환경변수
- 프로덕션: Vercel 환경변수

## 📝 엑셀 업로드 가이드

### 지원 필드
- **필수**: phone (전화번호)
- **선택**: name, gender, ageRange, residenceArea, familyRelation, occupation, investHabit, expectedBudget, ownAssets, lastVisitMH, notes, source, assigneeEmail

### 업로드 절차
1. 템플릿 다운로드
2. 데이터 입력
3. 파일 업로드
4. 중복/오류 확인
5. 결과 확인

## 🚨 중요 주의사항

- 전화번호는 숫자만 저장되며 자동으로 정규화됩니다
- 중복 전화번호는 자동으로 차단됩니다
- 모든 주요 작업은 감사 로그에 기록됩니다
- 프로덕션 환경에서는 반드시 강력한 AUTH_SECRET을 사용하세요

## 🐛 문제 해결

### 일반적인 문제
1. **데이터베이스 연결 오류**: DATABASE_URL 확인
2. **인증 오류**: AUTH_SECRET 및 NEXTAUTH_URL 확인
3. **빌드 오류**: `npm run lint` 실행 후 오류 수정
4. **Prisma 오류**: `npx prisma generate` 재실행

### 로그 확인
- 브라우저 개발자 도구 콘솔
- 서버 로그 (터미널)
- Vercel 함수 로그 (배포 시)

## 📞 지원

기술 지원이 필요한 경우 프로젝트 이슈를 생성하거나 개발팀에 문의하세요.

---

**© 2024 온시아 부동산. All rights reserved.**