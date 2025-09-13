'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Calendar, CheckCircle, XCircle, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Visit {
  id: string;
  title: string;
  start: string;
  end?: string;
  customerId: string;
  customerName: string;
  assigneeName: string;
  location?: string;
  note?: string;
  status: 'SCHEDULED' | 'CHECKED' | 'NO_SHOW';
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

interface VisitCalendarProps {
  visits?: Visit[];
  onVisitClick?: (visit: Visit) => void;
  onDateClick?: (date: Date) => void;
  onVisitStatusChange?: (visitId: string, status: 'SCHEDULED' | 'CHECKED' | 'NO_SHOW') => void;
}

export function VisitCalendar({
  visits = [],
  onVisitClick,
  onDateClick,
  onVisitStatusChange
}: VisitCalendarProps) {
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<Visit[]>([]);

  // 더미 데이터 (실제 API 연동 전)
  const dummyVisits: Visit[] = [
    {
      id: '1',
      title: '김철수 - 매물 방문',
      start: '2024-01-20T14:00:00',
      end: '2024-01-20T15:00:00',
      customerId: '1',
      customerName: '김철수',
      assigneeName: '박영업',
      location: '강남구 삼성동 래미안',
      note: '래미안 원베일리 모델하우스 방문',
      status: 'SCHEDULED',
      backgroundColor: '#3B82F6',
      borderColor: '#2563EB',
      textColor: 'white'
    },
    {
      id: '2',
      title: '이영희 - 계약 미팅',
      start: '2024-01-21T10:00:00',
      end: '2024-01-21T11:00:00',
      customerId: '2',
      customerName: '이영희',
      assigneeName: '김매니저',
      location: '송파구 사무실',
      note: '계약 상담',
      status: 'SCHEDULED',
      backgroundColor: '#10B981',
      borderColor: '#059669',
      textColor: 'white'
    },
    {
      id: '3',
      title: '박민수 - 상담',
      start: '2024-01-19T15:30:00',
      end: '2024-01-19T16:30:00',
      customerId: '3',
      customerName: '박민수',
      assigneeName: '이상담',
      location: '서초구 사무실',
      note: '임대 수익 상담 완료',
      status: 'CHECKED',
      backgroundColor: '#6B7280',
      borderColor: '#4B5563',
      textColor: 'white'
    }
  ];

  useEffect(() => {
    const eventsToShow = visits.length > 0 ? visits : dummyVisits;
    const formattedEvents = eventsToShow.map(visit => ({
      ...visit,
      backgroundColor: getStatusColor(visit.status).bg,
      borderColor: getStatusColor(visit.status).border,
      textColor: 'white'
    }));
    setCalendarEvents(formattedEvents);
  }, [visits]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { bg: '#3B82F6', border: '#2563EB' }; // blue
      case 'CHECKED':
        return { bg: '#10B981', border: '#059669' }; // green
      case 'NO_SHOW':
        return { bg: '#EF4444', border: '#DC2626' }; // red
      default:
        return { bg: '#6B7280', border: '#4B5563' }; // gray
    }
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { variant: 'secondary' as const, icon: Clock, text: '예정됨' };
      case 'CHECKED':
        return { variant: 'default' as const, icon: CheckCircle, text: '완료됨' };
      case 'NO_SHOW':
        return { variant: 'destructive' as const, icon: XCircle, text: '노쇼' };
      default:
        return { variant: 'outline' as const, icon: Clock, text: '미정' };
    }
  };

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const visit = calendarEvents.find(v => v.id === clickInfo.event.id);
    if (visit) {
      setSelectedVisit(visit);
      setIsSheetOpen(true);
      onVisitClick?.(visit);
    }
  };

  const handleDateClick = (dateClickInfo: { dateStr: string }) => {
    const clickedDate = new Date(dateClickInfo.dateStr);
    onDateClick?.(clickedDate);
  };

  const handleStatusChange = (visitId: string, newStatus: 'SCHEDULED' | 'CHECKED' | 'NO_SHOW') => {
    setCalendarEvents(prev => prev.map(visit =>
      visit.id === visitId
        ? {
            ...visit,
            status: newStatus,
            backgroundColor: getStatusColor(newStatus).bg,
            borderColor: getStatusColor(newStatus).border
          }
        : visit
    ));

    if (selectedVisit?.id === visitId) {
      setSelectedVisit(prev => prev ? { ...prev, status: newStatus } : null);
    }

    onVisitStatusChange?.(visitId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 전체</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calendarEvents.length}</div>
            <p className="text-xs text-muted-foreground">총 방문 일정</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {calendarEvents.filter(v => v.status === 'CHECKED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              완료율: {Math.round((calendarEvents.filter(v => v.status === 'CHECKED').length / calendarEvents.length) * 100) || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예정</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {calendarEvents.filter(v => v.status === 'SCHEDULED').length}
            </div>
            <p className="text-xs text-muted-foreground">남은 일정</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">노쇼</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {calendarEvents.filter(v => v.status === 'NO_SHOW').length}
            </div>
            <p className="text-xs text-muted-foreground">
              노쇼율: {Math.round((calendarEvents.filter(v => v.status === 'NO_SHOW').length / calendarEvents.length) * 100) || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 캘린더 */}
      <Card>
        <CardHeader>
          <CardTitle>방문 일정 캘린더</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView="dayGridMonth"
              locale={koLocale}
              events={calendarEvents}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              editable={false}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              eventDisplay="block"
              height="auto"
              aspectRatio={1.8}
              eventClassNames="cursor-pointer hover:opacity-80"
            />
          </div>
        </CardContent>
      </Card>

      {/* 방문 상세 사이드 패널 */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>방문 일정 상세</SheetTitle>
            <SheetDescription>
              방문 일정 정보를 확인하고 상태를 변경할 수 있습니다.
            </SheetDescription>
          </SheetHeader>

          {selectedVisit && (
            <div className="mt-6 space-y-6">
              {/* 상태 및 기본 정보 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{selectedVisit.customerName}</h3>
                  <Badge {...getStatusBadgeProps(selectedVisit.status)}>
                    {React.createElement(getStatusBadgeProps(selectedVisit.status).icon, {
                      className: "w-3 h-3 mr-1"
                    })}
                    {getStatusBadgeProps(selectedVisit.status).text}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedVisit.start), 'PPP (EEEE) HH:mm', { locale: ko })}
                    </span>
                  </div>

                  {selectedVisit.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedVisit.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>담당: {selectedVisit.assigneeName}</span>
                  </div>
                </div>

                {selectedVisit.note && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedVisit.note}</p>
                  </div>
                )}
              </div>

              {/* 상태 변경 버튼 */}
              <div className="space-y-3">
                <h4 className="font-medium">상태 변경</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedVisit.status === 'SCHEDULED' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedVisit.id, 'SCHEDULED')}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    예정
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedVisit.status === 'CHECKED' ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(selectedVisit.id, 'CHECKED')}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    완료
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedVisit.status === 'NO_SHOW' ? 'destructive' : 'outline'}
                    onClick={() => handleStatusChange(selectedVisit.id, 'NO_SHOW')}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    노쇼
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <style jsx>{`
        .calendar-container :global(.fc) {
          font-family: inherit;
        }
        .calendar-container :global(.fc-event) {
          border-radius: 4px;
          border: none !important;
          margin: 1px;
        }
        .calendar-container :global(.fc-event-title) {
          font-weight: 500;
          padding: 2px 4px;
        }
        .calendar-container :global(.fc-daygrid-day-number) {
          color: inherit;
          text-decoration: none;
        }
        .calendar-container :global(.fc-col-header-cell) {
          background: #f8fafc;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}