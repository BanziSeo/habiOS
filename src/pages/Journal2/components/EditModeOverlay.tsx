import React from 'react';
import { Button, theme } from 'antd';

interface EditModeOverlayProps {
  onToggleEditMode: () => void;
}

export const EditModeOverlay: React.FC<EditModeOverlayProps> = ({
  onToggleEditMode
}) => {
  const { token } = theme.useToken();
  
  return (
    <div 
      className="edit-mode-overlay"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <div>
        <div className="edit-mode-overlay-text">편집 모드</div>
        <div className="edit-mode-overlay-hint">E키를 눌러 편집 모드 종료</div>
      </div>
      <Button 
        type="primary" 
        onClick={onToggleEditMode}
        size="small"
      >
        편집 완료
      </Button>
    </div>
  );
};