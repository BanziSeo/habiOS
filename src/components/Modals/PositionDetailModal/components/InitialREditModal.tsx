import React from 'react';
import { Space, InputNumber, Button, theme } from 'antd';
import { useTranslation } from 'react-i18next';

interface InitialREditModalProps {
  visible: boolean;
  value: number;
  onChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  currency?: string;
  styles?: {
    [key: string]: React.CSSProperties;
  };
}

export const InitialREditModal: React.FC<InitialREditModalProps> = ({
  visible,
  value,
  onChange,
  onSave,
  onCancel,
  loading,
  currency
}) => {
  const { t } = useTranslation('common');
  const { token } = theme.useToken();
  
  if (!visible) return null;

  // 인라인 스타일 정의
  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: '24px',
    minWidth: '400px',
    boxShadow: token.boxShadowSecondary
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>{t('initialR.editTitle')}</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          <InputNumber
            value={value}
            onChange={(val) => onChange(val || 0)}
            prefix={currency === 'KRW' ? '₩' : '$'}
            precision={2}
            style={{ width: '100%' }}
            min={0}
          />
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>{t('button.cancel')}</Button>
            <Button type="primary" onClick={onSave} loading={loading}>
              {t('button.save')}
            </Button>
          </Space>
        </Space>
      </div>
    </div>
  );
};