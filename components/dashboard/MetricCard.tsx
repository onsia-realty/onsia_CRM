'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CountUp from 'react-countup';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
  delay?: number;
}

const colorStyles = {
  blue: {
    gradient: 'from-blue-500/20 to-blue-600/20',
    border: 'border-blue-200/30',
    icon: 'text-blue-600',
    bg: 'bg-blue-50/50',
  },
  green: {
    gradient: 'from-green-500/20 to-green-600/20',
    border: 'border-green-200/30',
    icon: 'text-green-600',
    bg: 'bg-green-50/50',
  },
  purple: {
    gradient: 'from-purple-500/20 to-purple-600/20',
    border: 'border-purple-200/30',
    icon: 'text-purple-600',
    bg: 'bg-purple-50/50',
  },
  orange: {
    gradient: 'from-orange-500/20 to-orange-600/20',
    border: 'border-orange-200/30',
    icon: 'text-orange-600',
    bg: 'bg-orange-50/50',
  },
  red: {
    gradient: 'from-red-500/20 to-red-600/20',
    border: 'border-red-200/30',
    icon: 'text-red-600',
    bg: 'bg-red-50/50',
  },
};

export function MetricCard({
  title,
  value,
  previousValue,
  target,
  unit = '',
  icon: Icon,
  color = 'blue',
  format = 'number',
  className,
  delay = 0,
}: MetricCardProps) {
  const styles = colorStyles[color];
  
  // Calculate change percentage
  const changePercent = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = changePercent >= 0;
  const progress = target ? (value / target) * 100 : undefined;
  
  // Format value based on type
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('ko-KR', { 
          style: 'currency', 
          currency: 'KRW',
          maximumFractionDigits: 0 
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('ko-KR');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      <Card className={cn(
        'relative overflow-hidden border-0 shadow-lg backdrop-blur-xl',
        `bg-gradient-to-br ${styles.gradient}`,
        'hover:shadow-xl transition-all duration-300'
      )}>
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <CountUp
                  end={value}
                  duration={2}
                  delay={delay}
                  className="text-3xl font-bold text-slate-900"
                  formattingFn={formatValue}
                />
                <span className="text-lg text-slate-600">{unit}</span>
              </div>
              
              {/* Change indicator */}
              {previousValue && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 1 }}
                  className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  <span className={cn(
                    'flex items-center',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {isPositive ? '↗' : '↘'} {Math.abs(changePercent).toFixed(1)}%
                  </span>
                  <span className="text-slate-500">vs 이전 기간</span>
                </motion.div>
              )}
            </div>
            
            {/* Icon with animated background */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={cn(
                'relative p-3 rounded-xl',
                styles.bg
              )}
            >
              <div className={cn(
                'absolute inset-0 rounded-xl',
                `bg-gradient-to-br ${styles.gradient}`,
                'opacity-60'
              )} />
              <Icon className={cn('relative h-6 w-6', styles.icon)} />
            </motion.div>
          </div>
          
          {/* Progress bar for target */}
          {target && progress !== undefined && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: delay + 1.5, duration: 0.8 }}
              className="mt-4 space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">목표 달성률</span>
                <span className="font-medium text-slate-900">
                  {Math.min(progress, 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={Math.min(progress, 100)}
                className="h-2"
              />
            </motion.div>
          )}
        </CardContent>
        
        {/* Subtle shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
          animate={{ 
            x: ['-100%', '100%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            delay: delay + 2,
            ease: 'easeInOut'
          }}
        />
      </Card>
    </motion.div>
  );
}