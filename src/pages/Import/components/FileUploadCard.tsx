import React from 'react';
import { Card, Upload, Space, Alert } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadProps } from 'antd';

const { Dragger } = Upload;

interface FileUploadCardProps {
  selectedFile: File | null;
  importing: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  selectedFile,
  importing,
  onFileSelect,
  onFileRemove,
}) => {
  const { t } = useTranslation('csvImport');

  const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
    onFileSelect(file);
    return false; // 자동 업로드 방지
  };

  return (
    <Card 
      title={
        <Space>
          <InboxOutlined />
          <span>{t('fileUpload.title')}</span>
        </Space>
      }
    >
      <Dragger
        name="file"
        accept=".csv"
        beforeUpload={handleFileUpload}
        disabled={importing}
        maxCount={1}
        onRemove={onFileRemove}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t('fileUpload.dragText')}</p>
        <p className="ant-upload-hint">
          {t('fileUpload.hint')}
        </p>
      </Dragger>

      {selectedFile && (
        <Alert
          message={
            <Space>
              <FileTextOutlined />
              {selectedFile.name}
            </Space>
          }
          type="info"
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default FileUploadCard;