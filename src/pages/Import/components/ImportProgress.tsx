import React from 'react';
import { Card, Progress, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ImportProgressProps {
  progress: number;
}

const ImportProgress: React.FC<ImportProgressProps> = ({ progress }) => {
  const { t } = useTranslation('csvImport');

  return (
    <Card>
      <Progress percent={progress} status="active" />
      <Text type="secondary">{t('button.importing')}</Text>
    </Card>
  );
};

export default ImportProgress;