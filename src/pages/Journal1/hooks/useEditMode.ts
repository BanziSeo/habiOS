import { useEffect } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';

/**
 * 편집 모드 관리 및 키보드 단축키
 */
export const useEditMode = () => {
  const { generalSettings, toggleEditMode } = useSettingsStore();
  const isEditMode = generalSettings.isEditMode || false;
  
  // 편집 모드 단축키 (E)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      ) {
        return;
      }
      
      // E 키로 편집 모드 토글
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        toggleEditMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleEditMode]);
  
  return {
    isEditMode,
    toggleEditMode
  };
};