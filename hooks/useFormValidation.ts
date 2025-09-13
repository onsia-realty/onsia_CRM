'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

export interface ValidationRule {
  field: string;
  schema: z.ZodSchema;
  message?: string;
}

export interface FieldError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface ValidationStatus {
  isValid: boolean;
  errors: Record<string, FieldError>;
  fieldStates: Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>;
  progress: number; // 0-100, 완료된 필수 필드 비율
}

interface UseFormValidationOptions {
  rules: ValidationRule[];
  data: Record<string, any>;
  requiredFields?: string[];
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  debounceMs?: number;
}

// 기본 유효성 검사 스키마들
export const validationSchemas = {
  name: z.string().min(1, '이름을 입력해주세요').min(2, '이름은 2글자 이상이어야 합니다'),
  phone: z.string().regex(/^01[016789]\d{7,8}$/, '올바른 휴대폰 번호를 입력해주세요'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  ageRange: z.string().min(1, '나이대를 선택해주세요'),
  gender: z.string().min(1, '성별을 선택해주세요'),
  residenceArea: z.string().optional(),
  familyRelation: z.string().optional(),
  occupation: z.string().optional(),
  investHabit: z.string().optional(),
  expectedBudget: z.number().min(0, '투자금액은 0 이상이어야 합니다').optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
};

export function useFormValidation({
  rules,
  data,
  requiredFields = [],
  mode = 'onChange',
  debounceMs = 300
}: UseFormValidationOptions): ValidationStatus {
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [fieldStates, setFieldStates] = useState<Record<string, 'idle' | 'validating' | 'valid' | 'invalid'>>({});
  const [validationTimeouts, setValidationTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  const validateField = useCallback(async (fieldName: string, value: any): Promise<FieldError | null> => {
    const rule = rules.find(r => r.field === fieldName);
    if (!rule) return null;

    try {
      await rule.schema.parseAsync(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          field: fieldName,
          message: error.errors[0]?.message || rule.message || `${fieldName} 필드가 유효하지 않습니다`,
          type: 'error'
        };
      }
      return {
        field: fieldName,
        message: rule.message || '유효성 검사 중 오류가 발생했습니다',
        type: 'error'
      };
    }
  }, [rules]);

  const validateAllFields = useCallback(async (): Promise<Record<string, FieldError>> => {
    const allErrors: Record<string, FieldError> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      const error = await validateField(rule.field, value);
      if (error) {
        allErrors[rule.field] = error;
      }
    }

    return allErrors;
  }, [rules, data, validateField]);

  const debouncedValidateField = useCallback((fieldName: string, value: any) => {
    // 이전 타이머 클리어
    if (validationTimeouts[fieldName]) {
      clearTimeout(validationTimeouts[fieldName]);
    }

    setFieldStates(prev => ({ ...prev, [fieldName]: 'validating' }));

    const timeout = setTimeout(async () => {
      const error = await validateField(fieldName, value);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });

      setFieldStates(prev => ({
        ...prev,
        [fieldName]: error ? 'invalid' : 'valid'
      }));

      setValidationTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[fieldName];
        return newTimeouts;
      });
    }, debounceMs);

    setValidationTimeouts(prev => ({ ...prev, [fieldName]: timeout }));
  }, [validateField, debounceMs, validationTimeouts]);

  // 데이터 변경 시 유효성 검사
  useEffect(() => {
    if (mode === 'onChange') {
      Object.keys(data).forEach(fieldName => {
        const rule = rules.find(r => r.field === fieldName);
        if (rule) {
          debouncedValidateField(fieldName, data[fieldName]);
        }
      });
    }

    return () => {
      // 컴포넌트 언마운트 시 모든 타이머 클리어
      Object.values(validationTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [data, mode, rules, debouncedValidateField, validationTimeouts]);

  // 진행률 계산
  const progress = useCallback(() => {
    if (requiredFields.length === 0) return 100;

    const completedFields = requiredFields.filter(field => {
      const value = data[field];
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined;
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [data, requiredFields]);

  // 전체 유효성 상태
  const isValid = useCallback(() => {
    // 필수 필드가 모두 채워져 있고
    const allRequiredFieldsFilled = requiredFields.every(field => {
      const value = data[field];
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined;
    });

    // 에러가 없어야 함
    const hasNoErrors = Object.keys(errors).length === 0;

    return allRequiredFieldsFilled && hasNoErrors;
  }, [data, requiredFields, errors]);

  // 특정 필드의 유효성 상태 반환
  const getFieldStatus = useCallback((fieldName: string) => {
    const hasError = !!errors[fieldName];
    const state = fieldStates[fieldName] || 'idle';
    const isRequired = requiredFields.includes(fieldName);
    const value = data[fieldName];
    const hasValue = typeof value === 'string' ? value.trim().length > 0 : 
                     Array.isArray(value) ? value.length > 0 : 
                     value !== null && value !== undefined;

    return {
      hasError,
      hasValue,
      isRequired,
      state,
      error: errors[fieldName] || null,
      isValid: !hasError && hasValue
    };
  }, [errors, fieldStates, requiredFields, data]);

  // 특정 스텝의 완료 상태 확인
  const isStepComplete = useCallback((stepFields: string[]) => {
    return stepFields.every(field => {
      const status = getFieldStatus(field);
      // 필수 필드는 값이 있고 에러가 없어야 함
      // 선택 필드는 에러만 없으면 됨
      if (status.isRequired) {
        return status.hasValue && !status.hasError;
      } else {
        return !status.hasError;
      }
    });
  }, [getFieldStatus]);

  return {
    isValid: isValid(),
    errors,
    fieldStates,
    progress: progress(),
    getFieldStatus,
    isStepComplete,
    validateField,
    validateAllFields
  };
}

export default useFormValidation;