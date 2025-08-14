import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { useTradingStore } from '../stores/tradingStore';
import { useMetricsStore } from '../stores/metricsStore';
import type { DailyPlan } from '../types';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface UseDailyPlanProps {
  selectedDate: dayjs.Dayjs;
}

interface UseDailyPlanReturn {
  // 상태
  loadedPlan: DailyPlan | null;
  isLoading: boolean;
  isSaving: boolean;
  
  // 일일 계획 데이터
  dailyRiskLimit: number;
  dailyRiskPercent: number;
  dailyNotes: string;
  
  // 액션
  loadDailyPlan: () => Promise<void>;
  saveDailyPlan: (data?: Partial<DailyPlan>) => Promise<DailyPlan | undefined>;
  updateDailyRiskLimit: (limit: number) => void;
  updateDailyRiskPercent: (percent: number) => void;
  updateDailyNotes: (notes: string) => void;
}

export const useDailyPlan = ({ selectedDate }: UseDailyPlanProps): UseDailyPlanReturn => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { activeAccount } = useTradingStore();
  const { totalAssets } = useMetricsStore();
  
  // 상태
  const [loadedPlan, setLoadedPlan] = useState<DailyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 일일 계획 데이터
  const [dailyRiskLimit, setDailyRiskLimit] = useState<number>(1000);
  const [dailyRiskPercent, setDailyRiskPercent] = useState<number>(1);
  const [dailyNotes, setDailyNotes] = useState<string>('');
  
  // 일일 계획 로드
  const loadDailyPlan = useCallback(async () => {
    if (!activeAccount) return;
    
    setIsLoading(true);
    try {
      const plan = await window.electronAPI.dailyPlan.get(
        activeAccount.id,
        selectedDate.format('YYYY-MM-DD')
      );
      
      if (plan) {
        setLoadedPlan(plan);
        setDailyRiskLimit(plan.dailyRiskLimit);
        setDailyNotes(plan.notes);
        
        // 저장된 금액에서 % 계산
        if (totalAssets && totalAssets > 0) {
          setDailyRiskPercent((plan.dailyRiskLimit / totalAssets) * 100);
        }
      } else {
        // 계획이 없으면 기본값으로 초기화
        setLoadedPlan(null);
        const defaultRiskPercent = 1;
        setDailyRiskPercent(defaultRiskPercent);
        setDailyRiskLimit(totalAssets ? totalAssets * (defaultRiskPercent / 100) : 1000);
        setDailyNotes('');
      }
    } catch (error) {
      console.error('Failed to load daily plan:', error);
      message.error(t('messages:dailyPlan.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount, selectedDate, totalAssets, message]);
  
  // 일일 계획 저장
  const saveDailyPlan = useCallback(async (data: Partial<DailyPlan> = {}) => {
    if (!activeAccount) return;
    
    setIsSaving(true);
    try {
      const plan: DailyPlan = {
        id: loadedPlan?.id,
        accountId: activeAccount.id,
        planDate: selectedDate.format('YYYY-MM-DD'),
        dailyRiskLimit: data.dailyRiskLimit ?? dailyRiskLimit,
        watchlist: data.watchlist ?? loadedPlan?.watchlist ?? [],
        notes: data.notes ?? dailyNotes,
      };
      
      const savedPlan = await window.electronAPI.dailyPlan.save(plan);
      setLoadedPlan(savedPlan);
      message.success(t('messages:dailyPlan.saveSuccess'));
      
      return savedPlan;
    } catch (error) {
      console.error('Failed to save daily plan:', error);
      message.error(t('messages:dailyPlan.saveError'));
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [activeAccount, selectedDate, loadedPlan, dailyRiskLimit, dailyNotes, message]);
  
  // 리스크 한도 업데이트 (금액)
  const updateDailyRiskLimit = useCallback((limit: number) => {
    setDailyRiskLimit(limit);
    if (totalAssets && totalAssets > 0) {
      setDailyRiskPercent((limit / totalAssets) * 100);
    }
  }, [totalAssets]);
  
  // 리스크 한도 업데이트 (퍼센트)
  const updateDailyRiskPercent = useCallback((percent: number) => {
    setDailyRiskPercent(percent);
    if (totalAssets) {
      setDailyRiskLimit(totalAssets * (percent / 100));
    }
  }, [totalAssets]);
  
  // 메모 업데이트
  const updateDailyNotes = useCallback((notes: string) => {
    setDailyNotes(notes);
  }, []);
  
  // 선택된 날짜나 계정이 변경되면 다시 로드
  useEffect(() => {
    if (activeAccount) {
      loadDailyPlan();
    }
  }, [activeAccount, selectedDate, loadDailyPlan]);
  
  return {
    // 상태
    loadedPlan,
    isLoading,
    isSaving,
    
    // 일일 계획 데이터
    dailyRiskLimit,
    dailyRiskPercent,
    dailyNotes,
    
    // 액션
    loadDailyPlan,
    saveDailyPlan,
    updateDailyRiskLimit,
    updateDailyRiskPercent,
    updateDailyNotes,
  };
};