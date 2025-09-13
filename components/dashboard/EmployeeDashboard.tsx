'use client';

import { motion } from 'framer-motion';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { ActivityFeed } from './ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Calendar, 
  Target,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  Plus,
  ArrowRight,
  Briefcase,
  Award,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface EmployeeDashboardProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
    team?: string;
  };
}

// Mock data - 실제 프로젝트에서는 API에서 가져올 데이터
const mockPersonalMetrics = [
  {
    title: '이번 달 상담',
    value: 32,
    previousValue: 28,
    target: 40,
    icon: Phone,
    color: 'blue' as const,
    unit: '건',
  },
  {
    title: '신규 고객',
    value: 12,
    previousValue: 8,
    target: 15,
    icon: User,
    color: 'green' as const,
    unit: '명',
  },
  {
    title: '목표 달성률',
    value: 78.5,
    previousValue: 65.2,
    target: 100,
    icon: Target,
    color: 'purple' as const,
    format: 'percentage' as const,
  },
  {
    title: '고객 만족도',
    value: 4.8,
    previousValue: 4.6,
    target: 5.0,
    icon: Star,
    color: 'orange' as const,
    unit: '/5',
  },
];

const mockPersonalChart = [
  { name: '월', value: 8 },
  { name: '화', value: 12 },
  { name: '수', value: 6 },
  { name: '목', value: 15 },
  { name: '금', value: 11 },
  { name: '토', value: 4 },
  { name: '일', value: 2 },
];

const mockPersonalActivities = [
  {
    id: '1',
    type: 'call' as const,
    title: '김영수님과 상담 완료',
    description: '강남 아파트 투자 상담, 추가 미팅 예정',
    user: { name: '나', role: '직원' },
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'completed' as const,
  },
  {
    id: '2',
    type: 'meeting' as const,
    title: '오후 3시 고객 미팅',
    description: '서초구 신축 상담 - 박민수님',
    user: { name: '나', role: '직원' },
    timestamp: new Date(Date.now() + 1000 * 60 * 60 * 2),
    status: 'pending' as const,
    priority: 'high' as const,
  },
  {
    id: '3',
    type: 'note' as const,
    title: '고객 정보 업데이트',
    description: '이번 주 상담 고객 5명 정보 추가',
    user: { name: '나', role: '직원' },
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'completed' as const,
  },
];

const todayTasks = [
  {
    id: '1',
    title: '김영수님 후속 상담',
    time: '10:00',
    type: 'call',
    priority: 'high',
    completed: true,
  },
  {
    id: '2',
    title: '박민수님 현장 미팅',
    time: '15:00',
    type: 'meeting',
    priority: 'high',
    completed: false,
  },
  {
    id: '3',
    title: '이번 주 상담 고객 정리',
    time: '17:00',
    type: 'admin',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    title: '내일 일정 확인',
    time: '18:00',
    type: 'admin',
    priority: 'low',
    completed: false,
  },
];

const recentCustomers = [
  {
    name: '김영수',
    lastContact: '2시간 전',
    status: '관심 높음',
    avatar: '',
    location: '강남구',
  },
  {
    name: '박민수',
    lastContact: '1일 전',
    status: '상담 예정',
    avatar: '',
    location: '서초구',
  },
  {
    name: '이수진',
    lastContact: '3일 전',
    status: '검토 중',
    avatar: '',
    location: '송파구',
  },
];

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const completedTasks = todayTasks.filter(task => task.completed).length;
  const completionRate = (completedTasks / todayTasks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
      {/* Personal Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-white/30">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-white/20 text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-emerald-200" />
                  <h1 className="text-3xl font-bold">안녕하세요, {user.name}님!</h1>
                </div>
                <div className="flex items-center gap-4 text-emerald-100">
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {user.role}
                  </span>
                  {user.team && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {user.team}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <p className="text-emerald-100">오늘의 진행률</p>
              <div className="flex items-center gap-3">
                <Progress 
                  value={completionRate} 
                  className="w-24 bg-white/20"
                />
                <span className="text-2xl font-bold">{Math.round(completionRate)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated background */}
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Personal Metrics */}
        <section className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-semibold text-slate-900 flex items-center gap-2"
          >
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            나의 성과
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {mockPersonalMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Today's Tasks */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  오늘의 할 일
                </CardTitle>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {completedTasks}/{todayTasks.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${
                    task.completed 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-white/50 border-slate-200 hover:bg-white/70'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-slate-600">{task.time}</p>
                  </div>
                  
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                </motion.div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-dashed border-slate-300 hover:border-emerald-300 hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 할 일 추가
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Performance Chart */}
          <div className="xl:col-span-2">
            <InteractiveChart
              title="이번 주 활동 현황"
              data={mockPersonalChart}
              type="bar"
              color="green"
              showTimeRange={false}
            />
          </div>
        </div>

        {/* Recent Customers & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Customers */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  최근 고객
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/customers">
                    전체보기 <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {recentCustomers.map((customer, index) => (
                <motion.div
                  key={customer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={customer.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-600">{customer.location}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={
                        customer.status === '관심 높음' ? 'border-green-300 text-green-700' :
                        customer.status === '상담 예정' ? 'border-blue-300 text-blue-700' :
                        'border-amber-300 text-amber-700'
                      }
                    >
                      {customer.status}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{customer.lastContact}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Personal Activity Feed */}
          <ActivityFeed activities={mockPersonalActivities} />
        </div>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            빠른 액션
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              asChild
              className="h-auto p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Link href="/dashboard/customers/new" className="text-center space-y-2">
                <Plus className="h-8 w-8 mx-auto" />
                <div>
                  <p className="font-semibold">신규 고객 등록</p>
                  <p className="text-sm opacity-90">새로운 고객을 시스템에 추가</p>
                </div>
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="h-auto p-6 border-2 hover:bg-slate-50"
            >
              <Link href="/dashboard/schedules" className="text-center space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-slate-600" />
                <div>
                  <p className="font-semibold">일정 관리</p>
                  <p className="text-sm text-slate-600">미팅과 상담 일정 확인</p>
                </div>
              </Link>
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="h-auto p-6 border-2 hover:bg-slate-50"
            >
              <Link href="/dashboard/customers" className="text-center space-y-2">
                <Phone className="h-8 w-8 mx-auto text-slate-600" />
                <div>
                  <p className="font-semibold">고객 관리</p>
                  <p className="text-sm text-slate-600">고객 정보 및 상담 기록</p>
                </div>
              </Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}