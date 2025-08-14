import React, { useState } from 'react';
import { Button, Space, Typography, Divider, Input, theme } from 'antd';
import { PlusOutlined, ReloadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableCategory } from '../types';

const { Text } = Typography;

interface SettingsPopoverProps {
  categories: TableCategory[];
  onAddCategory: () => void;
  onUpdateCategoryName: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onResetToDefault: () => void;
  onSelectMetrics: (categoryId: string) => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  categories,
  onAddCategory,
  onUpdateCategoryName,
  onDeleteCategory,
  onResetToDefault,
  onSelectMetrics,
}) => {
  const { t } = useTranslation('widgets');
  const { token } = theme.useToken();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');

  return (
    <div style={{ width: 280, maxWidth: '90vw' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>{t('metricsTable.settings.categoryManagement')}</Text>
          <Space size={4}>
            <Button 
              size="small" 
              type="text" 
              icon={<PlusOutlined />} 
              onClick={onAddCategory}
              title={t('metricsTable.settings.addCategory')}
            />
            <Button 
              size="small" 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={onResetToDefault}
              title={t('metricsTable.settings.reset')}
            />
          </Space>
        </div>
      </div>
      <Divider style={{ margin: '12px 0' }} />
      
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {categories.length === 0 ? (
          <Text type="secondary">{t('metricsTable.settings.noCategories')}</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {categories.map((category) => (
              <div key={category.id} style={{ 
                padding: '8px', 
                border: `1px solid ${token.colorBorder}`,
                borderRadius: 4,
                background: token.colorBgContainer
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    {editingCategoryId === category.id ? (
                      <Input
                        size="small"
                        value={tempCategoryName}
                        onChange={(e) => setTempCategoryName(e.target.value)}
                        onPressEnter={() => {
                          onUpdateCategoryName(category.id, tempCategoryName);
                          setEditingCategoryId(null);
                        }}
                        onBlur={() => {
                          onUpdateCategoryName(category.id, tempCategoryName);
                          setEditingCategoryId(null);
                        }}
                        autoFocus
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <>
                        <Text 
                          strong 
                          style={{ color: token.colorPrimary, cursor: 'pointer' }}
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setTempCategoryName(category.name);
                          }}
                        >
                          {category.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                          {category.metricIds.length}{t('metricsTable.settings.metrics')}
                        </Text>
                      </>
                    )}
                  </div>
                  <Space size={2}>
                    <Button
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => onSelectMetrics(category.id)}
                      title={t('metricsTable.settings.edit')}
                    />
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDeleteCategory(category.id)}
                      title={t('metricsTable.settings.delete')}
                    />
                  </Space>
                </div>
              </div>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
};