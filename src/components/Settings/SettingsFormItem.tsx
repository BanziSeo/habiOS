import React from 'react';
import { Form, Col } from 'antd';
import type { FormItemProps } from 'antd';

interface SettingsFormItemProps extends FormItemProps {
  label: string;
  children: React.ReactNode;
  colSpan?: number;
}

export const SettingsFormItem: React.FC<SettingsFormItemProps> = ({ 
  label, 
  children, 
  colSpan,
  ...formItemProps 
}) => {
  const item = (
    <Form.Item label={label} {...formItemProps}>
      {children}
    </Form.Item>
  );

  if (colSpan) {
    return <Col span={colSpan}>{item}</Col>;
  }

  return item;
};