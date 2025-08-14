import React from 'react';
import { Row, Col, Form, Checkbox, Select, InputNumber, ColorPicker, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FormInstance } from 'antd';

interface MovingAverageSettingsProps {
  form: FormInstance;
}

export const MovingAverageSettings: React.FC<MovingAverageSettingsProps> = ({ form }) => {
  const { t } = useTranslation('equityCurve');
  
  return (
    <div>
      <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
        {t('settings.movingAverages')}
      </Typography.Text>
      <Form.List name="movingAverages">
        {(fields) => (
          <>
            {fields.map((field, index) => (
              <Row key={field.key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                <Col span={3}>
                  <Form.Item 
                    name={[field.name, 'enabled']} 
                    valuePropName="checked" 
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item name={[field.name, 'type']} style={{ marginBottom: 0 }}>
                    <Select size="small">
                      <Select.Option value="EMA">EMA</Select.Option>
                      <Select.Option value="SMA">SMA</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item name={[field.name, 'period']} style={{ marginBottom: 0 }}>
                    <InputNumber 
                      size="small" 
                      min={1} 
                      max={500} 
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name={[field.name, 'color']} style={{ marginBottom: 0 }}>
                    <ColorPicker 
                      format="hex"
                      size="small"
                      onChange={(value) => {
                        const newMAs = [...form.getFieldValue('movingAverages')];
                        newMAs[index].color = value.toHexString();
                        form.setFieldValue('movingAverages', newMAs);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item name={[field.name, 'width']} style={{ marginBottom: 0 }}>
                    <Select size="small">
                      <Select.Option value={1}>1</Select.Option>
                      <Select.Option value={2}>2</Select.Option>
                      <Select.Option value={3}>3</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </>
        )}
      </Form.List>
    </div>
  );
};