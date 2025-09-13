import { describe, it, expect } from 'vitest'
import { createCustomerSchema } from '@/lib/validations/customer'

describe('Customer Validation', () => {
  describe('createCustomerSchema', () => {
    it('유효한 고객 데이터 검증 성공', () => {
      const validData = {
        name: '김철수',
        phone: '010-1234-5678',
        gender: '남성',
        ageRange: '40대',
        residenceArea: '강남구',
        occupation: '회사원',
        investHabit: '시세차익',
        expectedBudget: 100000000,
        source: '소개'
      }

      const result = createCustomerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('필수 필드 누락 시 검증 실패', () => {
      const invalidData = {
        name: '김철수',
        // phone 누락
        gender: '남성'
      }

      const result = createCustomerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue =>
          issue.path.includes('phone') && issue.code === 'invalid_type'
        )).toBe(true)
      }
    })

    it('예산은 양수여야 함', () => {
      const invalidData = {
        name: '김철수',
        phone: '010-1234-5678',
        expectedBudget: -1000000
      }

      const result = createCustomerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)

      if (!result.success) {
        expect(result.error.issues.some(issue =>
          issue.path.includes('expectedBudget')
        )).toBe(true)
      }
    })

    it('선택적 필드는 누락되어도 성공', () => {
      const minimalData = {
        phone: '010-1234-5678'
      }

      const result = createCustomerSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })
  })
})