import React from 'react';
import { Card, Radio, Space, Typography, InputNumber } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTradingStore } from '../../../stores/tradingStore';
import type { ImportType } from '../types';

const { Text } = Typography;

interface ImportTypeCardProps {
  importType: ImportType;
  currentAssets: number | null;
  importing: boolean;
  onImportTypeChange: (type: ImportType) => void;
  onCurrentAssetsChange: (value: number | null) => void;
}

const ImportTypeCard: React.FC<ImportTypeCardProps> = ({
  importType,
  currentAssets,
  importing,
  onImportTypeChange,
  onCurrentAssetsChange,
}) => {
  const { t } = useTranslation('csvImport');
  const { activeAccount } = useTradingStore();
  
  // 계정 통화에 따른 통화 기호 결정
  const isKRW = activeAccount?.currency === 'KRW';

  return (
    <Card 
      title={
        <Space>
          <FileTextOutlined />
          <span>{t('importType.title')}</span>
        </Space>
      }
    >
      <Radio.Group 
        value={importType} 
        onChange={(e) => onImportTypeChange(e.target.value)}
        disabled={importing}
      >
        <Space direction="vertical">
          <Radio value="APPEND">
            <Space direction="vertical" size={0}>
              <Text strong>{t('importType.append')}</Text>
              <Text type="secondary">{t('importType.appendDesc')}</Text>
            </Space>
          </Radio>
          <Radio value="FULL">
            <Space direction="vertical" size={0}>
              <Text strong>{t('importType.full')}</Text>
              <Text type="secondary">{t('importType.fullDesc')}</Text>
            </Space>
          </Radio>
        </Space>
      </Radio.Group>

      {importType === 'FULL' && (
        <div style={{ marginTop: 16 }}>
          <Text>{t('importType.currentAssets', { currency: activeAccount?.currency || 'USD' })}:</Text>
          <InputNumber
            style={{ width: 200, marginLeft: 8 }}
            value={currentAssets}
            onChange={onCurrentAssetsChange}
            formatter={value => 
              isKRW 
                ? `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={value => {
              const cleanValue = value!.replace(/[₩$\s,]/g, '');
              return Number(cleanValue);
            }}
            disabled={importing}
            placeholder={isKRW ? '예: 10,000,000' : '예: 100,000'}
          />
        </div>
      )}
    </Card>
  );
};

export default ImportTypeCard;