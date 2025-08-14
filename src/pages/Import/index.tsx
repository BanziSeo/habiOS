import React from 'react';
import { Button, Space, Typography } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ImportTypeCard from './components/ImportTypeCard';
import FileUploadCard from './components/FileUploadCard';
import ImportProgress from './components/ImportProgress';
import ImportResultCard from './components/ImportResultCard';
import { useImportLogic } from './hooks/useImportLogic';

const { Title, Paragraph } = Typography;

const ImportPage: React.FC = () => {
  const { t } = useTranslation('csvImport');
  const {
    importType,
    setImportType,
    currentAssets,
    setCurrentAssets,
    importing,
    importProgress,
    importResult,
    selectedFile,
    handleFileSelect,
    handleFileRemove,
    handleImport,
  } = useImportLogic();

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '860px',
        margin: '0 auto',
        padding: '24px 0',
        flex: 1
      }}>
        <Title level={2}>
          <Space>
            <CloudUploadOutlined />
            {t('title')}
          </Space>
        </Title>
        <Paragraph type="secondary">
          {t('description')}
        </Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 임포트 타입 선택 */}
          <ImportTypeCard
            importType={importType}
            currentAssets={currentAssets}
            importing={importing}
            onImportTypeChange={setImportType}
            onCurrentAssetsChange={setCurrentAssets}
          />

          {/* 파일 업로드 */}
          <FileUploadCard
            selectedFile={selectedFile}
            importing={importing}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
          />

          {/* 임포트 버튼 */}
          <Button
            type="primary"
            size="large"
            onClick={handleImport}
            loading={importing}
            disabled={!selectedFile || (importType === 'FULL' && !currentAssets)}
            block
          >
            {t('button.import')}
          </Button>

          {/* 진행 상태 */}
          {importing && <ImportProgress progress={importProgress} />}

          {/* 임포트 결과 */}
          {importResult && (
            <ImportResultCard
              importResult={importResult}
              importType={importType}
            />
          )}
        </Space>
      </div>
    </div>
  );
};

export default ImportPage;