'use client';

import { motion } from 'framer-motion';
import { Check, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function StepIndicator({ 
  steps, 
  currentStep, 
  onStepClick, 
  className 
}: StepIndicatorProps) {
  const handleStepClick = (stepId: number) => {
    // 이전 스텝들이 모두 완료된 경우에만 이동 허용
    const canNavigate = steps
      .slice(0, stepId - 1)
      .every(step => step.isCompleted);
    
    if (canNavigate && onStepClick) {
      onStepClick(stepId);
    }
  };

  return (
    <div className={cn("w-full py-6", className)}>
      {/* 진행률 바 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
          <span>진행률</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(currentStep / steps.length) * 100}%` 
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* 스텝 목록 */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = step.isCompleted;
          const isActive = step.id === currentStep;
          const isClickable = steps
            .slice(0, step.id - 1)
            .every(s => s.isCompleted);

          return (
            <div key={step.id} className="relative">
              {/* 연결선 */}
              {index < steps.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200">
                  <motion.div
                    className="w-full bg-gradient-to-b from-blue-500 to-blue-600"
                    initial={{ height: 0 }}
                    animate={{ 
                      height: isCompleted ? "100%" : "0%" 
                    }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  />
                </div>
              )}

              {/* 스텝 아이템 */}
              <motion.div
                className={cn(
                  "flex items-start gap-4 pb-6 cursor-pointer group",
                  !isClickable && "cursor-not-allowed"
                )}
                onClick={() => handleStepClick(step.id)}
                whileHover={isClickable ? { x: 4 } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* 스텝 아이콘 */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCompleted && "bg-green-500 border-green-500 text-white",
                      isActive && !isCompleted && "bg-blue-500 border-blue-500 text-white",
                      !isActive && !isCompleted && "bg-white border-gray-300 text-gray-400"
                    )}
                    whileScale={isActive ? 1.1 : 1}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4, type: "spring" }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Circle className={cn(
                        "w-4 h-4",
                        isActive ? "fill-current" : ""
                      )} />
                    )}
                  </motion.div>

                  {/* 활성 스텝 펄스 효과 */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500 opacity-20"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>

                {/* 스텝 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-semibold transition-colors duration-200",
                      isActive && "text-blue-600",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-gray-500"
                    )}>
                      {step.title}
                    </h3>
                    {isClickable && (
                      <ChevronRight className={cn(
                        "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                        isActive && "text-blue-500",
                        isCompleted && "text-green-500",
                        !isActive && !isCompleted && "text-gray-400"
                      )} />
                    )}
                  </div>
                  <p className={cn(
                    "text-sm mt-1 transition-colors duration-200",
                    isActive && "text-blue-500",
                    isCompleted && "text-green-500",
                    !isActive && !isCompleted && "text-gray-400"
                  )}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;