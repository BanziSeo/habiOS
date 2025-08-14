import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];  // intentional-any: Recharts의 다양한 차트 타입 지원
  label?: string;
  renderContent: (payload: any[], label?: string) => React.ReactNode;  // intentional-any: 각 차트별 커스텀 payload 구조
  backgroundColor?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  color?: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  renderContent,
  backgroundColor = '#1a1a1a',
  padding = '8px',
  border = '1px solid #333',
  borderRadius = '4px',
  color = '#fff'
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div style={{ 
      backgroundColor,
      padding,
      border,
      borderRadius,
      color
    }}>
      {renderContent(payload, label)}
    </div>
  );
};