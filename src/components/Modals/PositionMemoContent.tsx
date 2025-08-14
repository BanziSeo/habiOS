import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Rate, message, Button, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTradingStore } from '../../stores/tradingStore';
import type { Position } from '../../types';

const { TextArea } = Input;

interface PositionMemoContentProps {
  position: Position;
}

export const PositionMemoContent: React.FC<PositionMemoContentProps> = ({
  position,
}) => {
  const { t } = useTranslation('common');
  const [form] = Form.useForm();
  const { generalSettings } = useSettingsStore();
  const { updatePosition } = useTradingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (position) {
      form.setFieldsValue({
        setupType: position.setupType || undefined,
        rating: position.rating || 3,
        memo: position.memo || '',
      });
    }
  }, [position, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await updatePosition(position.id, {
        setupType: values.setupType || null,
        rating: values.rating,
        memo: values.memo || null,
      });

      message.success(t('positionMemo.saveSuccess'));
    } catch (error) {
      console.error('Failed to save position memo:', error);
      message.error(t('positionMemo.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            rating: 3,
          }}
        >
          <Form.Item
            name="setupType"
            label={t('positionMemo.setupType')}
          >
            <Select
              placeholder={t('positionMemo.selectSetup')}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {generalSettings.setupCategories?.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="rating"
            label={t('positionMemo.rating')}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="memo"
            label={t('positionMemo.memo')}
          >
            <TextArea
              rows={6}
              placeholder={t('positionMemo.memoPlaceholder')}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                onClick={handleSave}
                loading={loading}
              >
                {t('button.save')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
    </div>
  );
};