import React from 'react';
import { ColorPicker } from 'antd';
import type { ColorPickerProps } from 'antd';
import { formatColor } from '../../utils/colorUtils';
import { SettingsFormItem } from './SettingsFormItem';

// Ant Design ColorPicker의 value 타입을 사용
type Color = ColorPickerProps['value'];

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colSpan?: number;
  disabled?: boolean;
}

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  colSpan,
  disabled
}) => {
  return (
    <SettingsFormItem label={label} colSpan={colSpan}>
      <ColorPicker
        value={value}
        onChange={(color: Color) => onChange(formatColor(color))}
        disabled={disabled}
      />
    </SettingsFormItem>
  );
};