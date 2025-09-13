'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, MapPin, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoCompleteOption {
  value: string;
  label: string;
  category?: string;
}

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: AutoCompleteOption[];
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
  showRecentSuggestions?: boolean;
}

// 미리 정의된 옵션들
export const AREA_OPTIONS: AutoCompleteOption[] = [
  { value: '강남구', label: '강남구', category: '서울' },
  { value: '서초구', label: '서초구', category: '서울' },
  { value: '송파구', label: '송파구', category: '서울' },
  { value: '강동구', label: '강동구', category: '서울' },
  { value: '마포구', label: '마포구', category: '서울' },
  { value: '용산구', label: '용산구', category: '서울' },
  { value: '성동구', label: '성동구', category: '서울' },
  { value: '광진구', label: '광진구', category: '서울' },
  { value: '분당구', label: '분당구', category: '경기' },
  { value: '판교', label: '판교', category: '경기' },
  { value: '일산동구', label: '일산동구', category: '경기' },
  { value: '일산서구', label: '일산서구', category: '경기' },
  { value: '수지구', label: '수지구', category: '경기' },
  { value: '기흥구', label: '기흥구', category: '경기' },
];

export const OCCUPATION_OPTIONS: AutoCompleteOption[] = [
  { value: '회사원', label: '회사원', category: '일반' },
  { value: '공무원', label: '공무원', category: '일반' },
  { value: '교사', label: '교사', category: '교육' },
  { value: '의사', label: '의사', category: '의료' },
  { value: '간호사', label: '간호사', category: '의료' },
  { value: '약사', label: '약사', category: '의료' },
  { value: '변호사', label: '변호사', category: '법무' },
  { value: '회계사', label: '회계사', category: '회계' },
  { value: '세무사', label: '세무사', category: '회계' },
  { value: '개발자', label: '개발자', category: 'IT' },
  { value: '디자이너', label: '디자이너', category: 'IT' },
  { value: '자영업', label: '자영업', category: '사업' },
  { value: '사업가', label: '사업가', category: '사업' },
  { value: '프리랜서', label: '프리랜서', category: '기타' },
];

export function AutoCompleteInput({
  value,
  onChange,
  options,
  label,
  placeholder,
  icon,
  required = false,
  className,
  showRecentSuggestions = true
}: AutoCompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<AutoCompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSelections, setRecentSelections] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지에서 최근 선택 항목 로드
  useEffect(() => {
    if (showRecentSuggestions) {
      const key = `recent_${label?.toLowerCase().replace(' ', '_')}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setRecentSelections(JSON.parse(stored));
      }
    }
  }, [label, showRecentSuggestions]);

  // 필터링된 옵션 업데이트
  useEffect(() => {
    if (!searchTerm.trim()) {
      if (showRecentSuggestions && recentSelections.length > 0) {
        const recentOptions = recentSelections
          .map(recent => options.find(opt => opt.value === recent))
          .filter(Boolean) as AutoCompleteOption[];
        setFilteredOptions(recentOptions.slice(0, 5));
      } else {
        setFilteredOptions(options.slice(0, 8));
      }
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered.slice(0, 8));
    }
    setHighlightedIndex(-1);
  }, [searchTerm, options, recentSelections, showRecentSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: AutoCompleteOption) => {
    setSearchTerm(option.value);
    onChange(option.value);
    setIsOpen(false);
    
    // 최근 선택 항목에 추가
    if (showRecentSuggestions) {
      const key = `recent_${label?.toLowerCase().replace(' ', '_')}`;
      const updated = [
        option.value,
        ...recentSelections.filter(item => item !== option.value)
      ].slice(0, 5);
      setRecentSelections(updated);
      localStorage.setItem(key, JSON.stringify(updated));
    }
    
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // 옵션 클릭 시 blur 방지
    if (listRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setTimeout(() => setIsOpen(false), 150);
  };

  // 카테고리별 그룹핑
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || '기타';
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, AutoCompleteOption[]>);

  return (
    <div className={cn("relative space-y-2", className)}>
      <Label className="flex items-center gap-2 font-medium">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pr-8"
        />
        
        <ChevronDown className={cn(
          "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />

        {/* 드롭다운 옵션 */}
        <AnimatePresence>
          {isOpen && filteredOptions.length > 0 && (
            <motion.div
              ref={listRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              {!searchTerm.trim() && showRecentSuggestions && recentSelections.length > 0 && (
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Search className="w-3 h-3" />
                    최근 선택
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recentSelections.slice(0, 3).map((recent) => (
                      <Badge
                        key={recent}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-blue-100"
                        onClick={() => {
                          const option = options.find(opt => opt.value === recent);
                          if (option) handleOptionSelect(option);
                        }}
                      >
                        {recent}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="py-2">
                {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                  <div key={category}>
                    {Object.keys(groupedOptions).length > 1 && (
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                        {category}
                      </div>
                    )}
                    {categoryOptions.map((option, index) => {
                      const globalIndex = filteredOptions.indexOf(option);
                      return (
                        <motion.div
                          key={option.value}
                          className={cn(
                            "px-3 py-2 cursor-pointer transition-colors duration-150",
                            globalIndex === highlightedIndex 
                              ? "bg-blue-50 text-blue-600" 
                              : "hover:bg-gray-50"
                          )}
                          onClick={() => handleOptionSelect(option)}
                          whileHover={{ x: 2 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{option.label}</span>
                            {globalIndex === highlightedIndex && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-2 h-2 bg-blue-500 rounded-full"
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 입력 가이드 */}
      {!value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500"
        >
          입력하거나 아래 화살표를 클릭하여 선택하세요
        </motion.div>
      )}
    </div>
  );
}

export default AutoCompleteInput;