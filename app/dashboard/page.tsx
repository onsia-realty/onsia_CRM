'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700">로딩 중...</p>
          <p className="text-sm text-slate-500">현대적인 대시보드를 준비하고 있습니다</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // 사용자 정보 구성
  const userWithRole = session.user as { role?: string; team?: { name?: string } };
  const user = {
    name: session.user?.name || '사용자',
    role: userWithRole?.role || 'EMPLOYEE',
    avatar: session.user?.image,
    team: userWithRole?.team?.name,
  };

  // 역할에 따른 대시보드 렌더링
  const isAdmin = user.role === 'ADMIN' || user.role === 'HEAD';
  
  if (isAdmin) {
    return <AdminDashboard user={user} />;
  } else {
    return <EmployeeDashboard user={user} />;
  }
}