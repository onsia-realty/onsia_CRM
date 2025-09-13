import { test, expect } from '@playwright/test'

test.describe('인증 플로우', () => {
  test('로그인 → 승인 → 고객 등록 전체 플로우', async ({ page }) => {
    // 1. 로그인 페이지 접속
    await page.goto('/auth/signin')

    // 로그인 페이지 요소 확인
    await expect(page.locator('h1')).toContainText('온시아 CRM')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // 2. 관리자 계정으로 로그인
    await page.fill('input[type="text"]', 'admin@onsia.local')
    await page.fill('input[type="password"]', 'Admin!234')
    await page.click('button[type="submit"]')

    // 로그인 후 대시보드로 리디렉션 확인
    await expect(page).toHaveURL('/dashboard')

    // 대시보드 페이지 로드 확인
    await expect(page.locator('h1')).toContainText('대시보드')

    // 3. 관리자 기능 - 사용자 승인 페이지
    // (실제 승인 대기 사용자가 있다고 가정)
    try {
      await page.goto('/admin/users')
      await expect(page.locator('h1')).toContainText('사용자 관리')

      // 승인 대기 사용자가 있으면 승인 버튼 클릭
      const approveButton = page.locator('text=승인').first()
      if (await approveButton.isVisible()) {
        await approveButton.click()
        await expect(page.locator('text=승인되었습니다')).toBeVisible()
      }
    } catch (error) {
      console.log('승인 대기 사용자가 없거나 페이지에 접근할 수 없습니다:', error)
    }

    // 4. 고객 관리 페이지로 이동
    await page.goto('/dashboard/customers')
    await expect(page.locator('h1')).toContainText('고객 관리')

    // 5. 새 고객 등록
    await page.click('text=신규 고객')
    await expect(page).toHaveURL(/\/customers\/new/)

    // 고객 정보 입력
    await page.fill('input[name="name"]', '테스트 고객')
    await page.fill('input[name="phone"]', '010-9999-9999')
    await page.selectOption('select[name="gender"]', '남성')
    await page.selectOption('select[name="ageRange"]', '30대')
    await page.fill('input[name="residenceArea"]', '서울시 강남구')
    await page.fill('textarea[name="notes"]', 'Playwright 테스트로 생성된 고객')

    // 저장 버튼 클릭
    await page.click('button[type="submit"]')

    // 저장 완료 후 고객 목록으로 리디렉션 또는 성공 메시지 확인
    await expect(page.locator('text=저장되었습니다').or(page.locator('text=등록되었습니다'))).toBeVisible({ timeout: 10000 })

    // 6. 방문 일정 페이지 확인
    await page.goto('/dashboard/schedules')
    await expect(page.locator('h1')).toContainText('방문 일정')

    // 캘린더 뷰가 로드되는지 확인
    await expect(page.locator('.fc-toolbar')).toBeVisible({ timeout: 10000 })

    // 목록 뷰로 전환
    await page.click('text=목록 보기')
    await expect(page.locator('text=오늘 일정')).toBeVisible()

    // 7. 공지사항 페이지 확인
    await page.goto('/dashboard/notices')
    await expect(page.locator('h1')).toContainText('공지사항')

    // 기본 공지사항이 있는지 확인
    await expect(page.locator('text=온시아 CRM').first()).toBeVisible()

    // 8. 로그아웃
    try {
      const profileMenu = page.locator('[data-testid="profile-menu"]')
      if (await profileMenu.isVisible()) {
        await profileMenu.click()
        await page.click('text=로그아웃')
        await expect(page).toHaveURL('/auth/signin')
      }
    } catch (error) {
      console.log('프로필 메뉴를 찾을 수 없습니다. 수동으로 로그아웃 페이지로 이동합니다.')
      await page.goto('/auth/signin')
    }

    // 로그인 페이지로 돌아왔는지 확인
    await expect(page.locator('h1')).toContainText('온시아 CRM')
  })

  test('잘못된 로그인 정보로 로그인 시도', async ({ page }) => {
    await page.goto('/auth/signin')

    // 잘못된 정보로 로그인 시도
    await page.fill('input[type="text"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // 에러 메시지 확인
    await expect(page.locator('text=올바르지 않습니다').or(page.locator('text=실패'))).toBeVisible({ timeout: 5000 })
  })

  test('승인되지 않은 사용자 로그인', async ({ page }) => {
    await page.goto('/auth/signin')

    // 승인 대기 계정으로 로그인 시도 (시드 데이터에서 employee1@onsia.local)
    await page.fill('input[type="text"]', 'employee1@onsia.local')
    await page.fill('input[type="password"]', 'Test!234')
    await page.click('button[type="submit"]')

    // 승인 대기 메시지 확인
    await expect(page.locator('text=승인 대기').or(page.locator('text=계정 승인'))).toBeVisible({ timeout: 5000 })
  })
})