import React from 'react';
import { ColorPicker } from 'antd';
import { theme } from 'antd';
import { formatColor } from '../../../../utils/colorUtils';

interface ColorInputProps {
  value: string;
  defaultValue?: string;
  onChange: (color: string) => void;
  showCode?: boolean;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  value,
  defaultValue,
  onChange,
  showCode = true
}) => {
  const { token } = theme.useToken();
  const displayValue = value || defaultValue || token.colorText;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <ColorPicker
        value={displayValue}
        onChange={(color) => onChange(formatColor(color))}
        size="small"
      />
      {showCode && (
        <span style={{ 
          fontSize: '12px',
          color: token.colorTextSecondary,
          fontFamily: 'monospace',
          padding: '2px 6px',
          background: token.colorBgTextHover,
          borderRadius: '4px'
        }}>
          {displayValue}
        </span>
      )}
    </div>
  );
};