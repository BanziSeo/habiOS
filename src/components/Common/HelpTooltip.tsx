import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useHelpStore } from '../../stores/helpStore';

interface HelpTooltipProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  children,
  title,
  description,
  placement = 'top'
}) => {
  const { isHelpMode } = useHelpStore();
  
  // 도움말 모드가 꺼져있으면 자식 컴포넌트만 렌더링
  if (!isHelpMode) {
    return <>{children}</>;
  }
  
  const content = (
    <div style={{ maxWidth: 300 }}>
      <div style={{ fontWeight: 'bold', marginBottom: description ? 4 : 0 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          {description}
        </div>
      )}
    </div>
  );
  
  return (
    <Tooltip 
      title={content}
      placement={placement}
      overlayStyle={{ maxWidth: 350 }}
      mouseEnterDelay={0.3}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {children}
        {/* 도움말 모드일 때 작은 아이콘 표시 */}
        <QuestionCircleOutlined 
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            fontSize: 12,
            color: '#1890ff',
            opacity: 0.6,
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      </div>
    </Tooltip>
  );
};