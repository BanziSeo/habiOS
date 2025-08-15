import { useState, useEffect } from 'react';

interface JournalNames {
  journal1: string;
  journal2: string;
}

const STORAGE_KEY = 'journal_custom_names';

const DEFAULT_NAMES: JournalNames = {
  journal1: 'Journal_1',
  journal2: 'Journal_2'
};

export const useJournalNames = () => {
  const [journalNames, setJournalNames] = useState<JournalNames>(DEFAULT_NAMES);

  // localStorage에서 저장된 이름 불러오기 및 변경 감지
  useEffect(() => {
    // 초기 로드
    const loadNames = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setJournalNames({ ...DEFAULT_NAMES, ...parsed });
        } catch (e) {
          console.error('Failed to load journal names:', e);
        }
      }
    };

    loadNames();

    // storage 이벤트 리스너 추가 (다른 컴포넌트에서 변경 시 감지)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadNames();
      }
    };

    // custom 이벤트 리스너 추가 (같은 창에서 변경 시 감지)
    const handleCustomStorageChange = () => {
      loadNames();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('journal-names-changed', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journal-names-changed', handleCustomStorageChange);
    };
  }, []);

  // 이름 변경 함수
  const updateJournalName = (journal: 'journal1' | 'journal2', name: string) => {
    const trimmedName = name.trim();
    
    // 빈 값이면 기본값으로 복원
    const newName = trimmedName || DEFAULT_NAMES[journal];
    
    const newNames = {
      ...journalNames,
      [journal]: newName
    };
    
    setJournalNames(newNames);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNames));
    
    // 같은 창의 다른 컴포넌트에 변경 알림
    window.dispatchEvent(new Event('journal-names-changed'));
  };

  return {
    journalNames,
    updateJournalName,
    defaultNames: DEFAULT_NAMES
  };
};