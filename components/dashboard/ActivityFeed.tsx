'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  UserPlus, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  MoreHorizontal,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'call' | 'customer' | 'meeting' | 'note' | 'achievement' | 'reminder';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
    role?: string;
  };
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'overdue';
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  showAll?: boolean;
  className?: string;
}

const activityConfig = {
  call: {
    icon: Phone,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  customer: {
    icon: UserPlus,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  meeting: {
    icon: Calendar,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  note: {
    icon: FileText,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  achievement: {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  reminder: {
    icon: Bell,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

const priorityConfig = {
  low: { color: 'text-slate-500', bg: 'bg-slate-100' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-100' },
  high: { color: 'text-red-600', bg: 'bg-red-100' },
};

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500' },
  completed: { icon: CheckCircle, color: 'text-green-500' },
  overdue: { icon: AlertCircle, color: 'text-red-500' },
};

export function ActivityFeed({ 
  activities, 
  showAll = false, 
  className 
}: ActivityFeedProps) {
  const displayedActivities = showAll ? activities : activities.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-xl">
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-600" />
              실시간 활동
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4 max-h-96 overflow-y-auto">
          {displayedActivities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;
            const priority = activity.priority && priorityConfig[activity.priority];
            const status = activity.status && statusConfig[activity.status];
            const StatusIcon = status?.icon;
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1 
                }}
                whileHover={{ x: 4 }}
                className="group relative"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors duration-200">
                  {/* Activity Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      config.bg,
                      config.border,
                      'border'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </motion.div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900 leading-tight">
                          {activity.title}
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {activity.description}
                        </p>
                        
                        {/* User info */}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500">
                            {activity.user.name}
                          </span>
                          {activity.user.role && (
                            <Badge variant="secondary" className="text-xs py-0 px-2">
                              {activity.user.role}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Status and timestamp */}
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <div className="flex items-center gap-1">
                          {status && StatusIcon && (
                            <StatusIcon className={cn('h-4 w-4', status.color)} />
                          )}
                          {priority && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                'text-xs py-0 px-2',
                                priority.color,
                                priority.bg
                              )}
                            >
                              {activity.priority}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(activity.timestamp, { 
                            addSuffix: true
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connecting line */}
                {index < displayedActivities.length - 1 && (
                  <div className="absolute left-8 top-16 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
                )}
              </motion.div>
            );
          })}
          
          {/* Show more button */}
          {!showAll && activities.length > 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4 text-center"
            >
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                더 보기 ({activities.length - 6}개 추가)
              </Button>
            </motion.div>
          )}
          
          {/* Empty state */}
          {activities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">아직 활동이 없습니다</p>
            </motion.div>
          )}
        </CardContent>
        
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0"
          animate={{ 
            opacity: [0, 0.3, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut'
          }}
        />
      </Card>
    </motion.div>
  );
}