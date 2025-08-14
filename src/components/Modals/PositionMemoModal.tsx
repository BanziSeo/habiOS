import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, Rate, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTradingStore } from '../../stores/tradingStore';
import type { Position } from '../../types';

const { TextArea } = Input;

interface PositionMemoModalProps {
  visible: boolean;
  position: Position | null;
  onClose: () => void;
}

export const PositionMemoModal: React.FC<PositionMemoModalProps> = ({
  visible,
  position,
  onClose,
}) => {
  const { t } = useTranslation('common');
  const [form] = Form.useForm();
  const { generalSettings } = useSettingsStore();
  const { updatePosition } = useTradingStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (position && visible) {
      form.setFieldsValue({
        setupType: position.setupType || undefined,
        rating: position.rating || 3,
        memo: position.memo || '',
      });
    }
  }, [position, visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await updatePosition(position!.id, {
        setupType: values.setupType || null,
        rating: values.rating,
        memo: values.memo || null,
      });

      message.success(t('positionMemo.saveSuccess'));
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Failed to save position memo:', error);
      message.error(t('positionMemo.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  if (!position) return null;

  return (
    <Modal
      title={
        <span>
          <EditOutlined style={{ marginRight: 8 }} />
          {t('positionMemo.title')} - {position.tickerName || position.ticker}
        </span>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText={t('button.save')}
      cancelText={t('button.cancel')}
    >
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
          help={t('positionMemo.memoHelp')}
        >
          <TextArea
            rows={6}
            placeholder={t('positionMemo.memoPlaceholder')}
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};