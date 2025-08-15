import React from 'react';
import { Modal, Form, Space, Row, Col, ColorPicker, Checkbox, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ChartSettings } from '../types';
import { MovingAverageSettings } from './MovingAverageSettings';

interface ChartSettingsModalProps {
  visible: boolean;
  settings: ChartSettings;
  onOk: (settings: ChartSettings) => void;
  onCancel: () => void;
}

export const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({
  visible,
  settings,
  onOk,
  onCancel
}) => {
  const { t } = useTranslation('equityCurve');
  const [form] = Form.useForm();

  const handleOk = () => {
    const values = form.getFieldsValue();
    onOk(values);
  };

  return (
    <Modal
      title={t('settings.title')}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 차트 기본 설정 */}
          <div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t('settings.basicSettings')}
            </Typography.Text>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={t('settings.backgroundColor')} name="backgroundColor" style={{ marginBottom: 8 }}>
                  <ColorPicker 
                    format="hex"
                    onChange={(value) => {
                      form.setFieldValue('backgroundColor', value.toHexString());
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="showGrid" valuePropName="checked" style={{ marginBottom: 8 }}>
                  <Checkbox>{t('settings.gridLines')}</Checkbox>
                </Form.Item>
                <Form.Item label={t('settings.gridColor')} name="gridColor" style={{ marginBottom: 8 }}>
                  <ColorPicker 
                    format="hex"
                    onChange={(value) => {
                      form.setFieldValue('gridColor', value.toHexString());
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Equity Curve 라인 설정 */}
          <div>
            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t('settings.equityCurveLine')}
            </Typography.Text>
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Form.Item label={t('settings.color')} name="portfolioLineColor" style={{ marginBottom: 8 }}>
                  <ColorPicker 
                    format="hex"
                    onChange={(value) => {
                      form.setFieldValue('portfolioLineColor', value.toHexString());
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('settings.lineWidth')} name="portfolioLineWidth" style={{ marginBottom: 8 }}>
                  <Select>
                    <Select.Option value={1}>1</Select.Option>
                    <Select.Option value={2}>2</Select.Option>
                    <Select.Option value={3}>3</Select.Option>
                    <Select.Option value={4}>4</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 이동평균선 설정 */}
          <MovingAverageSettings form={form} />
        </Space>
      </Form>
    </Modal>
  );
};