import React from 'react';
import { Modal, Button, List, Checkbox, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ModalLayout } from '../types';
import { AVAILABLE_METRICS } from '../constants';
import { getUsedMetricIds } from '../utils/layoutHelpers';

const { Text } = Typography;

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  layout: ModalLayout;
  onToggleMetric: (metricId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  layout,
  onToggleMetric
}) => {
  const { t } = useTranslation('common');
  const usedIds = getUsedMetricIds(layout);

  return (
    <Modal
      title={t('positionDetail.configureMetrics')}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          {t('button.close')}
        </Button>
      ]}
      width={400}
      zIndex={10000}
      styles={{ mask: { zIndex: 9999 } }}
      getContainer={false}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {t('positionDetail.metricsSettingsHelp')}
        </Text>
      </div>
      <List
        dataSource={AVAILABLE_METRICS}
        renderItem={(metric) => (
          <List.Item style={{ padding: '8px 0' }}>
            <Checkbox
              checked={usedIds.has(metric.id)}
              onChange={() => onToggleMetric(metric.id)}
              style={{ width: '100%' }}
            >
              {metric.label}
            </Checkbox>
          </List.Item>
        )}
      />
    </Modal>
  );
};