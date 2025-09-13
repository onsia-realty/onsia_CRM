'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

interface UseAutoSaveOptions {
  key: string;
  data: any;
  delay?: number; // 자동저장 지연 시간 (ms)
  enabled?: boolean;
  onSave?: (data: any) => Promise<void>;
  onRestore?: (data: any) => void;
  showToast?: boolean;
}

export function useAutoSave({
  key,
  data,
  delay = 3000,
  enabled = true,
  onSave,
  onRestore,
  showToast = false
}: UseAutoSaveOptions) {
  const { toast } = useToast();
  const [status, setStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<string>('');
  const isInitialMount = useRef(true);

  // 데이터를 로컬 스토리지에 저장
  const saveToStorage = useCallback(async (dataToSave: any) => {
    try {
      const serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });

      localStorage.setItem(`autosave_${key}`, serializedData);
      
      setStatus({
        status: 'saved',
        lastSaved: new Date()
      });

      if (showToast) {
        toast({
          title: '자동 저장됨',
          description: '작성 중인 내용이 저장되었습니다.',
          duration: 2000,
        });
      }

      // 서버 저장 콜백이 있다면 실행
      if (onSave) {
        await onSave(dataToSave);
      }

    } catch (error) {
      setStatus({
        status: 'error',
        error: error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.'
      });

      if (showToast) {
        toast({
          title: '저장 실패',
          description: '자동 저장에 실패했습니다.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    }
  }, [key, onSave, showToast, toast]);

  // 로컬 스토리지에서 데이터 복원
  const restoreFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(`autosave_${key}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      
      // 버전 체크 및 만료일 검사 (7일)
      const savedDate = new Date(parsed.timestamp);
      const now = new Date();
      const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        clearStorage();
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to restore autosave data:', error);
      clearStorage();
      return null;
    }
  }, [key]);

  // 저장된 데이터 삭제
  const clearStorage = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    setStatus({ status: 'idle' });
  }, [key]);

  // 저장된 데이터가 있는지 확인
  const hasSavedData = useCallback(() => {
    const stored = localStorage.getItem(`autosave_${key}`);
    return !!stored;
  }, [key]);

  // 데이터 변경 감지 및 자동저장 트리거
  useEffect(() => {
    if (!enabled || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentData = JSON.stringify(data);
    
    // 데이터가 실제로 변경되었는지 확인
    if (currentData === lastDataRef.current) {
      return;
    }

    lastDataRef.current = currentData;

    // 이전 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus({ status: 'saving' });

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      saveToStorage(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, saveToStorage]);

  // 컴포넌트 마운트 시 저장된 데이터 복원
  useEffect(() => {
    if (onRestore) {
      const restoredData = restoreFromStorage();
      if (restoredData) {
        onRestore(restoredData);
        setStatus({
          status: 'saved',
          lastSaved: new Date()
        });
      }
    }
  }, [onRestore, restoreFromStorage]);

  // 수동 저장
  const save = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveToStorage(data);
  }, [data, saveToStorage]);

  // 수동 복원
  const restore = useCallback(() => {
    const restoredData = restoreFromStorage();
    if (restoredData && onRestore) {
      onRestore(restoredData);
      return true;
    }
    return false;
  }, [onRestore, restoreFromStorage]);

  return {
    status,
    save,
    restore,
    clearStorage,
    hasSavedData
  };
}

export default useAutoSave;