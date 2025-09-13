'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ChartType = 'area' | 'bar' | 'line' | 'pie';
type TimeRange = '7d' | '30d' | '90d' | '1y';

interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  date?: string;
}

interface InteractiveChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: ChartType;
  color?: string;
  height?: number;
  showTimeRange?: boolean;
  className?: string;
}

const colors = {
  blue: ['#3B82F6', '#1D4ED8', '#1E40AF'],
  green: ['#10B981', '#059669', '#047857'],
  purple: ['#8B5CF6', '#7C3AED', '#6D28D9'],
  orange: ['#F59E0B', '#D97706', '#B45309'],
  red: ['#EF4444', '#DC2626', '#B91C1C'],
};

const timeRanges = [
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
  { value: '1y', label: '1년' },
];

export function InteractiveChart({
  title,
  data,
  type = 'area',
  color = 'blue',
  height = 300,
  showTimeRange = true,
  className,
}: InteractiveChartProps) {
  const [chartType, setChartType] = useState<ChartType>(type);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isHovered, setIsHovered] = useState(false);

  const chartColors = colors[color as keyof typeof colors] || colors.blue;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200"
        >
          <p className="font-medium text-slate-900">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString('ko-KR')}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              className="text-slate-600 text-sm"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-slate-600 text-sm"
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColors[0]}
              fillOpacity={1}
              fill={`url(#gradient-${color})`}
              strokeWidth={3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              className="text-slate-600 text-sm"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-slate-600 text-sm"
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={chartColors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              className="text-slate-600 text-sm"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-slate-600 text-sm"
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColors[0]}
              strokeWidth={3}
              dot={{ fill: chartColors[0], strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: chartColors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Chart type selector */}
              <div className="flex rounded-lg bg-slate-100/50 p-1">
                {(['area', 'bar', 'line', 'pie'] as ChartType[]).map((chart) => (
                  <Button
                    key={chart}
                    variant={chartType === chart ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType(chart)}
                    className={cn(
                      'h-8 px-3 text-xs',
                      chartType === chart 
                        ? 'bg-white shadow-sm' 
                        : 'hover:bg-white/50'
                    )}
                  >
                    {chart.toUpperCase()}
                  </Button>
                ))}
              </div>
              
              {/* Time range selector */}
              {showTimeRange && (
                <div className="flex rounded-lg bg-slate-100/50 p-1">
                  {timeRanges.map((range) => (
                    <Button
                      key={range.value}
                      variant={timeRange === range.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setTimeRange(range.value as TimeRange)}
                      className={cn(
                        'h-8 px-3 text-xs',
                        timeRange === range.value 
                          ? 'bg-white shadow-sm' 
                          : 'hover:bg-white/50'
                      )}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <motion.div
            animate={{ scale: isHovered ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
            style={{ height }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
        
        {/* Subtle animation overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0"
          animate={{ 
            x: ['-100%', '100%'],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5,
            ease: 'easeInOut'
          }}
        />
      </Card>
    </motion.div>
  );
}