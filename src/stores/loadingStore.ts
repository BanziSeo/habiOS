import { create } from 'zustand';
import i18n from '../i18n';

interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  loadingTasks: Map<string, string>;
  
  // Actions
  setLoading: (taskId: string, text?: string) => void;
  clearLoading: (taskId: string) => void;
  clearAllLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingText: '',
  loadingTasks: new Map(),
  
  setLoading: (taskId: string, text?: string) => {
    const defaultText = text || i18n.t('messages:loading.default');
    set((state) => {
      const newTasks = new Map(state.loadingTasks);
      newTasks.set(taskId, defaultText);
      
      return {
        loadingTasks: newTasks,
        isLoading: newTasks.size > 0,
        loadingText: Array.from(newTasks.values()).join(' • ')
      };
    });
  },
  
  clearLoading: (taskId: string) => {
    set((state) => {
      const newTasks = new Map(state.loadingTasks);
      newTasks.delete(taskId);
      
      return {
        loadingTasks: newTasks,
        isLoading: newTasks.size > 0,
        loadingText: Array.from(newTasks.values()).join(' • ')
      };
    });
  },
  
  clearAllLoading: () => {
    set({
      loadingTasks: new Map(),
      isLoading: false,
      loadingText: ''
    });
  }
}));

// 편의 함수들
export const withLoading = async <T>(
  taskId: string,
  loadingText: string,
  task: () => Promise<T>
): Promise<T> => {
  const { setLoading, clearLoading } = useLoadingStore.getState();
  
  try {
    setLoading(taskId, loadingText);
    return await task();
  } finally {
    clearLoading(taskId);
  }
};