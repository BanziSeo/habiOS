import React from 'react';
import { Card, Alert, Space, Table, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ImportResult, ImportType } from '../types';
import { getPositionColumns } from '../constants';

const { Title } = Typography;

interface ImportResultCardProps {
  importResult: ImportResult;
  importType: ImportType;
}

const ImportResultCard: React.FC<ImportResultCardProps> = ({
  importResult,
  importType,
}) => {
  const { t } = useTranslation('csvImport');
  const positionColumns = getPositionColumns(t);

  return (
    <>
      {importResult.errors.length > 0 && (
        <Alert
          message={t('error.errors')}
          description={
            <ul>
              {importResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          }
          type="warning"
        />
      )}

      <Card title={t('result.title')}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={
              importResult.stats && importType === 'APPEND' 
                ? t('success.importComplete', {
                    savedTrades: importResult.stats.savedTrades,
                    skippedTrades: importResult.stats.skippedTrades,
                    savedPositions: importResult.stats.savedPositions,
                    skippedPositions: importResult.stats.skippedPositions
                  })
                : t('success.importSuccess', { 
                    trades: importResult.trades.length, 
                    positions: importResult.positions.length 
                  })
            }
            type="success"
          />

          {importResult.positions.length > 0 && (
            <>
              <Title level={4}>{t('result.importedPositions')}</Title>
              <Table
                dataSource={importResult.positions}
                columns={positionColumns}
                rowKey="id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </>
          )}
        </Space>
      </Card>
    </>
  );
};

export default ImportResultCard;