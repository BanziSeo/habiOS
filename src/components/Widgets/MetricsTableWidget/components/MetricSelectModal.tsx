import React, { useState } from 'react';
import { Modal, Checkbox, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { MetricConfig } from '../constants';
import type { TableCategory } from '../types';

const { Text } = Typography;

interface MetricSelectModalProps {
  visible: boolean;
  category: TableCategory | undefined;
  availableMetrics: MetricConfig[];
  onOk: (categoryId: string, metricIds: string[]) => void;
  onCancel: () => void;
}

export const MetricSelectModal: React.FC<MetricSelectModalProps> = ({
  visible,
  category,
  availableMetrics,
  onOk,
  onCancel,
}) => {
  const { t } = useTranslation('widgets');
  const [tempSelected, setTempSelected] = useState<string[]>(category?.metricIds || []);

  React.useEffect(() => {
    setTempSelected(category?.metricIds || []);
  }, [category]);

  return (
    <Modal
      title={t('metricsTable.settings.selectMetricsTitle', { categoryName: category?.name })}
      open={visible}
      onOk={() => {
        if (category) {
          onOk(category.id, tempSelected);
        }
      }}
      onCancel={onCancel}
      width={600}
      styles={{ body: { maxHeight: 500, overflowY: 'auto' } }}
    >
      <Checkbox.Group
        value={tempSelected}
        onChange={setTempSelected}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {availableMetrics.map(metric => (
            <Checkbox key={metric.id} value={metric.id}>
              <Space>
                <Text>{metric.name}</Text>
                <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                  {metric.value}
                </Text>
              </Space>
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>
    </Modal>
  );
};