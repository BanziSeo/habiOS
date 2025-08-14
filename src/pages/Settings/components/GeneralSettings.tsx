import React, { useState, useMemo } from 'react';
import {
  Card,
  Form,
  Select,
  InputNumber,
  Space,
  Typography,
  Input,
  Button,
  Tag,
  message,
  theme,
} from 'antd';
import {
  DollarOutlined,
  LineChartOutlined,
  PlusOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { getThemeList } from '../../../constants/theme';

const { Text } = Typography;
const { OptGroup, Option } = Select;

export const GeneralSettings: React.FC = React.memo(() => {
  const { t } = useTranslation('settings');
  const { token } = theme.useToken();
  const {
    generalSettings,
    updateGeneralSettings,
    addSetupCategory,
    removeSetupCategory,
  } = useSettingsStore();
  const { language, setLanguage } = useLanguageStore();
  
  const [newCategory, setNewCategory] = useState('');
  const themeList = getThemeList();
  
  // 테마를 다크/라이트로 그룹화
  const groupedThemes = useMemo(() => {
    const dark = themeList.filter(t => t.mode === 'dark');
    const light = themeList.filter(t => t.mode === 'light');
    return { dark, light };
  }, [themeList]);
  
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      message.warning(t('general.setupCategories.emptyError'));
      return;
    }
    if (generalSettings.setupCategories?.includes(newCategory.trim())) {
      message.warning(t('general.setupCategories.duplicateError'));
      return;
    }
    addSetupCategory(newCategory.trim());
    setNewCategory('');
    message.success(t('general.setupCategories.addSuccess'));
  };
  
  const handleRemoveCategory = (category: string) => {
    removeSetupCategory(category);
    message.success(t('general.setupCategories.deleteSuccess'));
  };

  return (
    <>
      <Card
        title={
          <Space>
            <GlobalOutlined />
            <span>{t('general.language')}</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Form layout="vertical">
          <Form.Item label={t('general.language')}>
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: 200 }}
            >
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="ko">한국어</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <BgColorsOutlined />
            <span>{t('general.theme')}</span>
          </Space>
        }
      >
        <Form layout="vertical">
          <Form.Item label={t('general.theme')}>
            <Select
              value={generalSettings.colorTheme || 'moonlight-mist'}
              onChange={(value) => updateGeneralSettings({ colorTheme: value })}
            >
              <OptGroup label="🌙 Dark Themes">
                {groupedThemes.dark.map((theme) => (
                  <Option key={theme.key} value={theme.key}>
                    <Space>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: theme.primary,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      />
                      <span>{theme.name}</span>
                    </Space>
                  </Option>
                ))}
              </OptGroup>
              <OptGroup label="☀️ Light Themes">
                {groupedThemes.light.map((theme) => (
                  <Option key={theme.key} value={theme.key}>
                    <Space>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: theme.primary,
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      />
                      <span>{theme.name}</span>
                    </Space>
                  </Option>
                ))}
              </OptGroup>
            </Select>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              {themeList.find(t => t.key === (generalSettings.colorTheme || 'moonlight-mist'))?.description}
            </Text>
          </Form.Item>

          <Form.Item label={t('general.currency.label')}>
            <Select
              value={generalSettings.defaultCurrency}
              onChange={(value) => updateGeneralSettings({ defaultCurrency: value })}
            >
              <Select.Option value="USD">{t('general.currency.usd')}</Select.Option>
              <Select.Option value="KRW">{t('general.currency.krw')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('general.timeDisplay.label')}>
            <Select
              value={generalSettings.timeDisplay || 'broker'}
              onChange={(value) => updateGeneralSettings({ timeDisplay: value })}
            >
              <Select.Option value="broker">{t('general.timeDisplay.brokerTime')}</Select.Option>
              <Select.Option value="actual">{t('general.timeDisplay.actualTime')}</Select.Option>
            </Select>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              {t('general.timeDisplay.brokerTimeDesc')}
            </Text>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>{t('general.commission.title')}</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Form layout="vertical">
          <Form.Item label={t('general.commission.buyRate')}>
            <InputNumber
              defaultValue={Number(((generalSettings.buyCommissionRate || 0.0007) * 100).toFixed(2))}
              min={0}
              max={1}
              step={0.01}
              precision={2}
              onBlur={(e) => {
                const value = Number(e.target.value);
                updateGeneralSettings({
                  buyCommissionRate: (value || 0) / 100
                });
              }}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('general.commission.buyRateDesc')}
            </Text>
          </Form.Item>

          <Form.Item label={t('general.commission.sellRate')}>
            <InputNumber
              defaultValue={Number(((generalSettings.sellCommissionRate || 0.0007) * 100).toFixed(2))}
              min={0}
              max={1}
              step={0.01}
              precision={2}
              onBlur={(e) => {
                const value = Number(e.target.value);
                updateGeneralSettings({
                  sellCommissionRate: (value || 0) / 100
                });
              }}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('general.commission.sellRateDesc')}
            </Text>
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <LineChartOutlined />
            <span>{t('general.statistics.title')}</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Form layout="vertical">
          <Form.Item label={t('general.statistics.winRateThreshold')}>
            <InputNumber
              defaultValue={generalSettings.winRateThreshold || 0.05}
              min={0}
              max={1}
              step={0.01}
              precision={2}
              onBlur={(e) => {
                const value = Number(e.target.value);
                updateGeneralSettings({
                  winRateThreshold: value || 0.05
                });
              }}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              {t('general.statistics.winRateThresholdDesc')}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t('general.statistics.winRateThresholdExample')}
            </Text>
          </Form.Item>
        </Form>
      </Card>
      
      <Card
        title={
          <Space>
            <AppstoreOutlined />
            <span>{t('general.setupCategories.title')}</span>
          </Space>
        }
        style={{ marginTop: 16 }}
      >
        <Form layout="vertical">
          <Form.Item label={t('general.setupCategories.addCategory')}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t('general.setupCategories.categoryNamePlaceholder')}
                onPressEnter={handleAddCategory}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddCategory}
              >
                {t('actions.add')}
              </Button>
            </Space.Compact>
          </Form.Item>
          
          <Form.Item label={t('general.setupCategories.registeredCategories')}>
            <div style={{ minHeight: 32 }}>
              {generalSettings.setupCategories && generalSettings.setupCategories.length > 0 ? (
                <Space wrap>
                  {generalSettings.setupCategories.map((category) => (
                    <Tag
                      key={category}
                      closable
                      onClose={() => handleRemoveCategory(category)}
                      style={{ marginBottom: 4 }}
                    >
                      {category}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">{t('general.setupCategories.noCategories')}</Text>
              )}
            </div>
          </Form.Item>
          
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {t('general.setupCategories.managementDesc')}
          </Text>
        </Form>
      </Card>
    </>
  );
});