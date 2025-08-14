import { useState, useEffect, useCallback } from 'react';
import type { MetricGroup } from '../types';
import { getDefaultGroups, STORAGE_KEYS } from '../constants';

export const useMetricsGroups = () => {
  const [groups, setGroups] = useState<MetricGroup[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    } else {
      setGroups(getDefaultGroups());
    }
    setIsLoaded(true);
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    }
  }, [groups, isLoaded]);

  // 그룹 추가
  const addGroup = useCallback(() => {
    const newGroup: MetricGroup = {
      id: `group-${Date.now()}`,
      title: 'New Category',
      order: groups.length
    };
    setGroups([...groups, newGroup]);
    return newGroup;
  }, [groups]);

  // 그룹 제목 업데이트
  const updateGroupTitle = useCallback((groupId: string, title: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, title } : g
    ));
  }, [groups]);

  // 그룹 삭제
  const deleteGroup = useCallback((groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  }, [groups]);

  return {
    groups,
    isLoaded,
    addGroup,
    updateGroupTitle,
    deleteGroup,
  };
};