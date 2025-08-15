import React, { useState } from 'react';
import { 
  Card,
  Button, 
  message, 
  Modal,
  Alert,
  Spin,
  Typography,
  Divider,
  Space,
  theme
} from 'antd';
import { 
  SaveOutlined, 
  UploadOutlined, 
  ExclamationCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;

export const DataManagement: React.FC = () => {
  const { t } = useTranslation('settings');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { token } = theme.useToken();

  // 백업 처리
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // localStorage 데이터 수집
      const localStorageData: Record<string, any> = {};
      const keysToBackup = [
        'journal_custom_names',
        'journal1_presets',
        'journal2_presets',
        'journal1WidgetLayouts',
        'journal1HiddenWidgets',
        'journal1HiddenCards',
        'journal2WidgetLayouts',
        'journal2HiddenWidgets',
        'journal2HiddenCards',
        'journalWidgetLayouts',
        'journalHiddenWidgets',
        'journalHiddenCards'
      ];
      
      keysToBackup.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          localStorageData[key] = value;
        }
      });

      const result = await window.electronAPI.database.backup(localStorageData);
      if (result.success) {
        message.success(`${t('data.backup.success')}: ${result.filePath}`);
      } else {
        message.error(result.error || t('data.backup.error'));
      }
    } catch (error) {
      console.error('Backup error:', error);
      message.error(t('data.backup.error'));
    } finally {
      setIsBackingUp(false);
    }
  };

  // 복원 확인 모달
  const showRestoreConfirm = () => {
    Modal.confirm({
      title: t('data.restore.confirmTitle'),
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Alert
            message={t('data.restore.warning')}
            description={t('data.restore.confirmMessage')}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </div>
      ),
      okText: t('actions.restore'),
      okType: 'danger',
      cancelText: t('actions.cancel'),
      onOk: handleRestore,
    });
  };

  // 복원 처리
  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await window.electronAPI.database.restore();
      if (result.success) {
        // localStorage 데이터 복원
        if (result.localStorageData) {
          Object.keys(result.localStorageData).forEach(key => {
            localStorage.setItem(key, result.localStorageData[key]);
          });
        }
        
        message.success(t('data.restore.success'));
        
        // 앱 재시작 권장 모달
        Modal.info({
          title: t('data.restore.restartTitle'),
          content: t('data.restore.restartMessage'),
          okText: t('actions.confirm'),
          onOk: () => {
            // 페이지 새로고침으로 localStorage 적용
            window.location.reload();
          }
        });
      } else if (result.cancelled) {
        // 사용자가 파일 선택을 취소한 경우
        message.info(t('data.restore.cancelled'));
      } else {
        message.error(result.error || t('data.restore.error'));
      }
    } catch (error) {
      console.error('Restore error:', error);
      message.error(t('data.restore.error'));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: '"SUITE Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <Card>
        <Title level={4}>
          <DatabaseOutlined /> {t('data.title')}
        </Title>
        <Paragraph type="secondary">
          {t('data.description')}
        </Paragraph>

        <Divider />

        {/* 데이터 백업 섹션 */}
        <div style={{ marginBottom: 32 }}>
          <Title level={5}>{t('data.backup.title')}</Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t('data.backup.description')}
          </Paragraph>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleBackup}
            loading={isBackingUp}
            size="large"
          >
            {t('data.backup.button')}
          </Button>
        </div>

        <Divider />

        {/* 데이터 복원 섹션 */}
        <div>
          <Title level={5}>{t('data.restore.title')}</Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {t('data.restore.description')}
            <Text type="danger"> {t('data.restore.warning')}</Text>
          </Paragraph>
          <Button
            icon={<UploadOutlined />}
            onClick={showRestoreConfirm}
            loading={isRestoring}
            size="large"
          >
            {t('data.restore.button')}
          </Button>
        </div>

        {/* 로딩 오버레이 */}
        {(isBackingUp || isRestoring) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: token.colorBgMask,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
          }}>
            <Space direction="vertical" align="center">
              <Spin size="large" />
              <Text style={{ color: token.colorWhite }}>
                {isBackingUp ? t('data.backup.loading') : t('data.restore.loading')}
              </Text>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
};