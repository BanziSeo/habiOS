import React from 'react';
import { Typography, Slider, Checkbox, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import type { SettingsPopoverProps } from '../types';
import { getDefaultCards } from '../constants';

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  settings,
  onSettingsChange,
  hiddenCards,
  onToggleCard,
}) => {
  const { t } = useTranslation('widgets');
  const {
    categoryFontSize,
    titleFontSize,
    valueFontSize,
    subValueFontSize,
    categoryBold,
    titleBold,
    valueBold,
    subValueBold,
  } = settings;

  return (
    <div style={{ width: 800 }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: 16, fontSize: 16 }}>
        {t('metricsWidget.settings.title')}
      </Typography.Text>
      
      <div style={{ display: 'flex', gap: 24 }}>
        {/* 1열: 폰트 크기 설정 */}
        <div style={{ width: 280 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 12, color: '#00D982' }}>
            {t('metricsWidget.settings.fontSize.title')}
          </Typography.Text>
          
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text>
                {t('metricsWidget.settings.fontSize.category')}: {categoryFontSize}px
              </Typography.Text>
              <Checkbox
                checked={categoryBold}
                onChange={(e) => onSettingsChange({ categoryBold: e.target.checked })}
              >
                {t('metricsWidget.settings.fontSize.bold')}
              </Checkbox>
            </div>
            <Slider
              min={10}
              max={28}
              value={categoryFontSize}
              onChange={(value) => onSettingsChange({ categoryFontSize: value })}
            />
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text>
                {t('metricsWidget.settings.fontSize.metricName')}: {titleFontSize}px
              </Typography.Text>
              <Checkbox
                checked={titleBold}
                onChange={(e) => onSettingsChange({ titleBold: e.target.checked })}
              >
                {t('metricsWidget.settings.fontSize.bold')}
              </Checkbox>
            </div>
            <Slider
              min={8}
              max={20}
              value={titleFontSize}
              onChange={(value) => onSettingsChange({ titleFontSize: value })}
            />
          </div>
          
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text>
                {t('metricsWidget.settings.fontSize.mainValue')}: {valueFontSize}px
              </Typography.Text>
              <Checkbox
                checked={valueBold}
                onChange={(e) => onSettingsChange({ valueBold: e.target.checked })}
              >
                {t('metricsWidget.settings.fontSize.bold')}
              </Checkbox>
            </div>
            <Slider
              min={10}
              max={36}
              value={valueFontSize}
              onChange={(value) => onSettingsChange({ valueFontSize: value })}
            />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Typography.Text>
                {t('metricsWidget.settings.fontSize.subValue')}: {subValueFontSize}px
              </Typography.Text>
              <Checkbox
                checked={subValueBold}
                onChange={(e) => onSettingsChange({ subValueBold: e.target.checked })}
              >
                {t('metricsWidget.settings.fontSize.bold')}
              </Checkbox>
            </div>
            <Slider
              min={8}
              max={18}
              value={subValueFontSize}
              onChange={(value) => onSettingsChange({ subValueFontSize: value })}
            />
          </div>
        </div>
        
        {/* 구분선 */}
        <div style={{ width: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        {/* 2열: 미리보기 */}
        <div style={{ width: 200 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 12, color: '#00D982' }}>
            {t('metricsWidget.settings.preview.title')}
          </Typography.Text>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 6,
            padding: 12
          }}>
            <div style={{ 
              fontSize: categoryFontSize, 
              color: '#00D982',
              fontWeight: categoryBold ? 'bold' : 600,
              marginBottom: 10
            }}>
              {t('metricsWidget.settings.preview.sampleCategory')}
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 80,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: titleFontSize,
                color: 'rgba(255, 255, 255, 0.65)',
                marginBottom: 4,
                fontWeight: titleBold ? 'bold' : 'normal'
              }}>
                {t('metricsWidget.settings.preview.sampleMetric')}
              </div>
              <div style={{ fontSize: valueFontSize, fontWeight: valueBold ? 'bold' : 'normal' }}>
                {t('metricsWidget.settings.preview.sampleValue')}
              </div>
              <div style={{ 
                fontSize: subValueFontSize, 
                color: 'rgba(255, 255, 255, 0.45)', 
                marginTop: 2,
                fontWeight: subValueBold ? 'bold' : 'normal'
              }}>
                {t('metricsWidget.settings.preview.sampleSubValue')}
              </div>
            </div>
          </div>
        </div>
        
        {/* 3열: 표시할 메트릭 선택 */}
        <div style={{ flex: 1 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 12, color: '#00D982' }}>
            {t('metricsWidget.settings.selectMetrics')}
          </Typography.Text>
          <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {getDefaultCards().map(card => (
                <Checkbox
                  key={card.id}
                  checked={!hiddenCards.includes(card.id)}
                  onChange={() => onToggleCard(card.id)}
                >
                  {card.title}
                </Checkbox>
              ))}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};