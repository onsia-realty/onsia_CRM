import { describe, it, expect } from 'vitest'
import { normalizePhone, formatPhoneNumber } from '@/lib/utils/phone'

describe('Phone Utils', () => {
  describe('normalizePhone', () => {
    it('숫자만 남기고 정규화해야 함', () => {
      expect(normalizePhone('010-1234-5678')).toBe('01012345678')
      expect(normalizePhone('010 1234 5678')).toBe('01012345678')
      expect(normalizePhone('010.1234.5678')).toBe('01012345678')
      expect(normalizePhone('(010)1234-5678')).toBe('01012345678')
    })

    it('유효하지 않은 전화번호는 빈 문자열 반환', () => {
      expect(normalizePhone('123')).toBe('')
      expect(normalizePhone('abc-def-ghij')).toBe('')
      expect(normalizePhone('')).toBe('')
    })

    it('한국 휴대폰 번호 형식 검증', () => {
      expect(normalizePhone('010-1234-5678')).toBe('01012345678')
      expect(normalizePhone('011-123-4567')).toBe('01112345678')
      expect(normalizePhone('016-123-4567')).toBe('01612345678')
      expect(normalizePhone('017-123-4567')).toBe('01712345678')
      expect(normalizePhone('018-123-4567')).toBe('01812345678')
      expect(normalizePhone('019-123-4567')).toBe('01912345678')
    })
  })

  describe('formatPhoneNumber', () => {
    it('전화번호를 하이픈 형식으로 포맷해야 함', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678')
      expect(formatPhoneNumber('0212345678')).toBe('02-1234-5678')
      expect(formatPhoneNumber('05012345678')).toBe('050-1234-5678')
    })

    it('유효하지 않은 번호는 원본 반환', () => {
      expect(formatPhoneNumber('123')).toBe('123')
      expect(formatPhoneNumber('')).toBe('')
      expect(formatPhoneNumber('abc')).toBe('abc')
    })
  })
})