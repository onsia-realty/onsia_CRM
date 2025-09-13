'use client';

import { motion } from 'framer-motion';
import { MetricCard } from './MetricCard';
import { InteractiveChart } from './InteractiveChart';
import { ActivityFeed } from './ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  UserCheck,
  AlertTriangle,
  Settings,
  BarChart3,
  Target,
  Crown,
  Zap,
  Lightbulb
} from 'lucide-react';
interface AdminDashboardProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}

// Mock data - 실제 프로젝트에서는 API에서 가져올 데이터
const mockMetrics = [
  {
    title: '전체 직원',
    value: 47,
    previousValue: 44,
    target: 50,
    icon: Users,
    color: 'blue' as const,
    unit: '명',
  },
  {
    title: '이번 달 매출',
    value: 285000000,
    previousValue: 230000000,
    icon: TrendingUp,
    color: 'green' as const,
    format: 'currency' as const,
  },
  {
    title: '활성 고객',
    value: 1847,
    previousValue: 1650,
    target: 2000,
    icon: UserCheck,
    color: 'purple' as const,
    unit: '명',
  },
  {
    title: '팀 효율성',
    value: 87.5,
    previousValue: 82.3,
    target: 90,
    icon: Target,
    color: 'orange' as const,
    format: 'percentage' as const,
  },
];

const mockChartData = [
  { name: '1월', value: 120, category: 'sales' },
  { name: '2월', value: 190, category: 'sales' },
  { name: '3월', value: 300, category: 'sales' },
  { name: '4월', value: 250, category: 'sales' },
  { name: '5월', value: 400, category: 'sales' },
  { name: '6월', value: 350, category: 'sales' },
];

const mockActivities = [
  {
    id: '1',
    type: 'achievement' as const,
    title: '김철수님이 월 목표를 달성했습니다',
    description: '이번 달 계약 건수 15건으로 목표 초과 달성',
    user: { name: '김철수', role: '팀장' },
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    priority: 'high' as const,
    status: 'completed' as const,
  },
  {
    id: '2',
    type: 'reminder' as const,
    title: '월간 성과 리뷰 미팅',
    description: '오후 3시 회의실 A에서 진행 예정',
    user: { name: '관리자', role: 'ADMIN' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    priority: 'medium' as const,
    status: 'pending' as const,
  },
  {
    id: '3',
    type: 'customer' as const,
    title: '신규 고객 10명 등록',
    description: '강남 지역 고객 집중 등록',
    user: { name: '이영희', role: '직원' },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'completed' as const,
  },
];

const teamPerformance = [
  { team: '1본부-1팀', members: 12, performance: 95, trend: 'up' },
  { team: '1본부-2팀', members: 15, performance: 87, trend: 'up' },
  { team: '2본부-1팀', members: 10, performance: 78, trend: 'stable' },
  { team: '2본부-2팀', members: 10, performance: 92, trend: 'up' },
];

const insights = [
  {
    icon: Lightbulb,
    title: 'AI 인사이트',
    content: '강남 지역 고객의 전환율이 25% 상승했습니다. 마케팅 리소스를 집중 배치하세요.',
    type: 'suggestion',
  },
  {
    icon: AlertTriangle,
    title: '주의 필요',
    content: '2본부-1팀의 성과가 목표 대비 15% 부족합니다. 추가 지원이 필요할 수 있습니다.',
    type: 'warning',
  },
  {
    icon: Crown,
    title: '우수 성과',
    content: '김철수 팀장이 3개월 연속 목표를 초과 달성했습니다. 모범 사례를 팀에 공유하세요.',
    type: 'achievement',
  },
];

export function AdminDashboard({ user }: AdminDashboardProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-yellow-300" />
                <h1 className="text-3xl font-bold">관리자 대시보드</h1>
              </div>
              <p className="text-xl text-blue-100">
                안녕하세요, {user.name}님! 조직의 성과를 한눈에 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Zap className="h-4 w-4 mr-1" />
                실시간 업데이트
              </Badge>
              <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                설정
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <section className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-semibold text-slate-900 flex items-center gap-2"
          >
            <BarChart3 className="h-6 w-6 text-blue-600" />
            핵심 지표
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {mockMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                {...metric}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Charts and Analytics */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <InteractiveChart
            title="월별 매출 현황"
            data={mockChartData}
            type="area"
            color="blue"
          />
          
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                팀별 성과 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {teamPerformance.map((team, index) => (
                <motion.div
                  key={team.team}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{team.team}</p>
                    <p className="text-sm text-slate-600">{team.members}명</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">{team.performance}%</span>
                      <span className={
                        team.trend === 'up' ? 'text-green-600' : 
                        team.trend === 'down' ? 'text-red-600' : 'text-slate-400'
                      }>
                        {team.trend === 'up' ? '↗' : team.trend === 'down' ? '↘' : '→'}
                      </span>
                    </div>
                    <Progress value={team.performance} className="w-20" />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* AI Insights & Activity Feed */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* AI Insights */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
            <CardHeader className="relative">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                AI 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'suggestion' ? 'bg-blue-50/50 border-blue-500' :
                    insight.type === 'warning' ? 'bg-amber-50/50 border-amber-500' :
                    'bg-green-50/50 border-green-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <insight.icon className={`h-5 w-5 mt-0.5 ${
                      insight.type === 'suggestion' ? 'text-blue-600' :
                      insight.type === 'warning' ? 'text-amber-600' :
                      'text-green-600'
                    }`} />
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{insight.title}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{insight.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="xl:col-span-2">
            <ActivityFeed activities={mockActivities} />
          </div>
        </section>
      </div>
    </div>
  );
}