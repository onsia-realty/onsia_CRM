'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function SmartPhoneInput({
  value,
  onChange,
  onValidation,
  label = "연락처",
  placeholder = "010-1234-5678",
  required = false,
  className
}: SmartPhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (input: string): string => {
    // 숫자만 추출
    const numbers = input.replace(/[^\d]/g, '');
    
    // 최대 11자리까지만 허용
    const truncated = numbers.slice(0, 11);
    
    if (truncated.length <= 3) {
      return truncated;
    } else if (truncated.length <= 7) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
    } else {
      return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(7)}`;
    }
  };

  // 전화번호 유효성 검사
  const validatePhoneNumber = (phone: string): boolean => {
    const numbers = phone.replace(/[^\d]/g, '');
    // 한국 휴대폰 번호 패턴 (010, 011, 016, 017, 018, 019로 시작하는 10-11자리)
    const mobilePattern = /^01[016789]\d{7,8}$/;
    // 일반 전화번호 패턴 (02, 031-070으로 시작)
    const landlinePattern = /^(02|0[3-6]\d)\d{7,8}$/;
    
    return mobilePattern.test(numbers) || landlinePattern.test(numbers);
  };

  useEffect(() => {
    const numbers = value.replace(/[^\d]/g, '');
    const formatted = formatPhoneNumber(numbers);
    setDisplayValue(formatted);
    
    const valid = validatePhoneNumber(numbers);
    setIsValid(valid);
    
    if (onValidation) {
      onValidation(valid);
    }
  }, [value, onValidation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);
    const numbers = inputValue.replace(/[^\d]/g, '');
    
    setDisplayValue(formatted);
    onChange(numbers); // 숫자만 저장
    
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const handleBlur = () => {
    setShowFeedback(true);
  };

  const handleFocus = () => {
    setShowFeedback(false);
  };

  const getStatusColor = () => {
    if (!isTouched && !showFeedback) return "border-gray-300";
    if (isValid) return "border-green-500 ring-green-500/20";
    if (displayValue.length > 0) return "border-red-500 ring-red-500/20";
    return "border-gray-300";
  };

  const getStatusIcon = () => {
    if (!isTouched && !showFeedback) return null;
    if (isValid) return <Check className="w-4 h-4 text-green-500" />;
    if (displayValue.length > 0) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getHelpText = () => {
    if (!isTouched && !showFeedback) return null;
    if (isValid) return "올바른 전화번호입니다";
    if (displayValue.length > 0) return "올바른 전화번호 형식이 아닙니다";
    return null;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-2 font-medium">
        <Phone className="w-4 h-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          type="tel"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={cn(
            "pr-10 transition-all duration-300",
            getStatusColor(),
            isValid && "ring-2",
            displayValue.length > 0 && !isValid && showFeedback && "ring-2"
          )}
        />
        
        {/* 상태 아이콘 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AnimatePresence>
            {getStatusIcon() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {getStatusIcon()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 피드백 메시지 */}
      <AnimatePresence>
        {getHelpText() && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-sm flex items-center gap-1",
              isValid ? "text-green-600" : "text-red-600"
            )}
          >
            {getStatusIcon()}
            {getHelpText()}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 입력 가이드 */}
      {!isTouched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500"
        >
          휴대폰 또는 일반전화 번호를 입력하세요 (자동 포맷팅)
        </motion.div>
      )}
    </div>
  );
}

export default SmartPhoneInput;