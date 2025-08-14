import React from 'react';
import { InputNumber, Button, Space, Typography, Dropdown, Tabs, Empty } from 'antd';
import { PlusOutlined, MinusOutlined, PercentageOutlined, NumberOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { StopLossItem } from '../../hooks/useStopLossManager';

const { Text } = Typography;

interface StopLossFormProps {
  stopLosses: StopLossItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'price' | 'percentage' | 'quantity', value: number | undefined) => void;
  onSave?: () => void;
  
  // Position info for display
  totalShares: number;
  currency?: string;
  
  // UI options
  inputMode?: 'percentage' | 'quantity';
  onInputModeChange?: (mode: 'percentage' | 'quantity') => void;
  showTabs?: boolean;
  maxItems?: number;
  
  // Refs
  firstInputRef?: React.RefObject<HTMLInputElement>;
  
  // Validation
  errors?: string[];
}

/**
 * 스탑로스 입력 폼 공통 컴포넌트
 * StopLossModal과 StopLossEditPopover에서 공통으로 사용
 */
export const StopLossForm: React.FC<StopLossFormProps> = ({
  stopLosses,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  totalShares,
  currency = 'USD',
  inputMode = 'percentage',
  onInputModeChange,
  showTabs = false,
  maxItems = 4,
  firstInputRef,
  errors = []
}) => {
  const { t, i18n } = useTranslation('widgets');
  const currencySymbol = currency === 'KRW' ? '₩' : '$';

  // 빈 상태 처리
  if (stopLosses.length === 0) {
    return (
      <div>
        <Empty 
          description={t('stopLoss.form.noStopLoss')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: '40px 0' }}
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onAdd}
          block
        >
          {t('stopLoss.form.addStopLoss')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 에러 메시지 표시 */}
      {errors.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {errors.map((error, index) => (
            <Text key={index} type="danger" style={{ display: 'block', fontSize: 12 }}>
              {error}
            </Text>
          ))}
        </div>
      )}

      {/* 입력 모드 탭 */}
      {showTabs && onInputModeChange && (
        <Tabs
          activeKey={inputMode}
          onChange={(key) => onInputModeChange(key as 'percentage' | 'quantity')}
          size="small"
          style={{ marginBottom: 12 }}
          items={[
            {
              key: 'percentage',
              label: (
                <span>
                  <PercentageOutlined /> Ratio
                </span>
              ),
            },
            {
              key: 'quantity',
              label: (
                <span>
                  <NumberOutlined /> Quantity
                </span>
              ),
            },
          ]}
        />
      )}

      {/* 스탑로스 항목들 */}
      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        {stopLosses.map((sl, index) => (
          <div key={sl.id}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <InputNumber
                ref={index === 0 ? firstInputRef : undefined}
                className="stop-loss-price-input"
                value={sl.price}
                onChange={(val) => onUpdate(sl.id, 'price', val !== null ? val : undefined)}
                onPressEnter={onSave}
                placeholder={t('stopLoss.form.price')}
                prefix={currencySymbol}
                precision={2}
                style={{ width: 120 }}
                min={0}
                size="small"
              />
              
              {inputMode === 'percentage' ? (
                <Dropdown
                  menu={{
                    onClick: ({ key }) => onUpdate(sl.id, 'percentage', Number(key)),
                    items: [
                      { key: '25', label: '25%' },
                      { key: '50', label: '50%' },
                      { key: '75', label: '75%' },
                      { key: '100', label: '100%' },
                    ]
                  }}
                  trigger={['click']}
                >
                  <Button 
                    size="small"
                    style={{ width: 100, fontSize: 12 }}
                    onClick={(e) => e.preventDefault()}
                  >
                    {sl.percentage || 0}% <DownOutlined />
                  </Button>
                </Dropdown>
              ) : (
                <InputNumber
                  value={sl.quantity}
                  onChange={(val) => onUpdate(sl.id, 'quantity', val || 0)}
                  onPressEnter={onSave}
                  placeholder={t('stopLoss.form.quantity')}
                  suffix={i18n.language === 'ko' ? '주' : ''}
                  precision={0}
                  style={{ width: 100 }}
                  min={0}
                  max={totalShares}
                  size="small"
                />
              )}
              
              <Button
                type="text"
                size="small"
                icon={<MinusOutlined />}
                onClick={() => onRemove(sl.id)}
                disabled={stopLosses.length === 1}
              />
            </div>
            
            {/* 수량/비율 표시 */}
            <div style={{ marginLeft: 4, marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                = {sl.quantity}{i18n.language === 'ko' ? '주' : ` ${t('stopLoss.form.shares')}`} ({sl.percentage.toFixed(1)}%)
              </Text>
            </div>
          </div>
        ))}
      </Space>

      {/* 추가 버튼 */}
      <Button
        type="text"
        size="small"
        icon={<PlusOutlined />}
        onClick={onAdd}
        disabled={stopLosses.length >= maxItems}
        style={{ marginTop: 12 }}
      />
    </div>
  );
};