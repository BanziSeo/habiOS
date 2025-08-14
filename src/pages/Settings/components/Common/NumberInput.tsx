import React, { useState, useEffect } from 'react';
import { InputNumber } from 'antd';
import type { InputNumberProps } from 'antd';

interface NumberInputProps extends Omit<InputNumberProps, 'onChange' | 'onBlur'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  width?: number | string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  defaultValue,
  onChange,
  width = '100%',
  ...restProps
}) => {
  const [localValue, setLocalValue] = useState<number | null>(value ?? defaultValue ?? null);
  
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);
  
  const handleBlur = () => {
    if (onChange && localValue !== value) {
      onChange(localValue);
    }
  };
  
  return (
    <InputNumber
      {...restProps}
      value={localValue}
      onChange={(value) => setLocalValue(value as number | null)}
      onBlur={handleBlur}
      style={{ width }}
    />
  );
};