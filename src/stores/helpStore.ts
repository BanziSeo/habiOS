import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HelpStore {
  // 상태
  isHelpMode: boolean;
  
  // 액션
  toggleHelpMode: () => void;
  setHelpMode: (enabled: boolean) => void;
}

export const useHelpStore = create<HelpStore>()(
  persist(
    (set) => ({
      // 초기 상태
      isHelpMode: false,
      
      // 액션
      toggleHelpMode: () => set((state) => ({ isHelpMode: !state.isHelpMode })),
      setHelpMode: (enabled: boolean) => set({ isHelpMode: enabled }),
    }),
    {
      name: 'help-storage',
      partialize: (state) => ({ isHelpMode: state.isHelpMode }), // 도움말 모드 상태만 저장
    }
  )
);