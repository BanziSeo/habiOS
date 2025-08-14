import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'compact' 
  | 'icon' 
  | 'iconText' 
  | 'danger' 
  | 'ghost' 
  | 'minimal';

export interface AppButtonProps extends Omit<ButtonProps, 'type' | 'size'> {
  variant?: ButtonVariant;
  size?: 'large' | 'middle' | 'small';
}

export const AppButton: React.FC<AppButtonProps> = ({ 
  variant = 'primary', 
  size,
  children,
  ...props 
}) => {
  const presets: Record<ButtonVariant, Partial<ButtonProps>> = {
    primary: {
      type: 'primary',
      size: size || 'middle',
    },
    secondary: {
      type: 'default',
      size: size || 'middle',
    },
    compact: {
      type: 'link',
      size: size || 'small',
      style: { padding: '4px 8px', height: 'auto' }
    },
    icon: {
      type: 'text',
      size: size || 'small',
      shape: 'circle',
      style: { minWidth: '24px', width: '24px', height: '24px', padding: 0 }
    },
    iconText: {
      type: 'text',
      size: size || 'small',
      style: { padding: '4px 12px' }
    },
    danger: {
      type: 'link',
      danger: true,
      size: size || 'small',
    },
    ghost: {
      ghost: true,
      size: size || 'small',
    },
    minimal: {
      type: 'text',
      size: size || 'small',
      style: { 
        minWidth: 'auto', 
        padding: '2px 4px', 
        height: 'auto',
        fontSize: '12px' 
      }
    }
  };

  const presetProps = presets[variant] || presets.primary;

  return (
    <Button 
      {...presetProps} 
      {...props}
      size={size || presetProps.size}
      style={{ ...presetProps.style, ...props.style }}
    >
      {children}
    </Button>
  );
};