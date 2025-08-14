import type { ColorPickerProps } from 'antd';

// Ant Design ColorPicker의 value 타입을 사용
type Color = ColorPickerProps['value'];

/**
 * Color 객체나 string을 hex string으로 변환
 * @param color - Ant Design Color 객체 또는 문자열
 * @returns hex 색상 문자열
 */
export const formatColor = (color: Color | string | unknown): string => {
  if (typeof color === 'string') return color;
  
  // Type guard for Color object with toHexString method
  if (color && typeof color === 'object' && 'toHexString' in color) {
    return (color as { toHexString: () => string }).toHexString();
  }
  
  // Fallback for other objects
  if (color && typeof color === 'object' && 'toString' in color) {
    return String(color);
  }
  
  return '#000000';
};