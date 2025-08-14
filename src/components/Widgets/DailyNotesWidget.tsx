import React, { useState } from 'react';
import { Space, Button, Input, Typography, theme } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTradingStore } from '../../stores/tradingStore';
import dayjs from 'dayjs';
import { getWidgetStyles } from '../../styles/widgetStyles';
import { useDailyPlan } from '../../hooks/useDailyPlan';

const { Text } = Typography;
const { TextArea } = Input;

interface DailyNotesWidgetProps {
  selectedDate: dayjs.Dayjs;
}

export const DailyNotesWidget: React.FC<DailyNotesWidgetProps> = ({ selectedDate }) => {
  const { t } = useTranslation('widgets');
  const { activeAccount } = useTradingStore();
  const { token } = theme.useToken();
  const widgetStyles = getWidgetStyles();
  const [isEditing, setIsEditing] = useState(false);
  
  // 커스텀 훅 사용
  const {
    loadedPlan,
    isSaving,
    dailyNotes,
    saveDailyPlan,
    updateDailyNotes,
  } = useDailyPlan({ selectedDate });
  
  const handleSave = async () => {
    await saveDailyPlan({ notes: dailyNotes });
    setIsEditing(false);
  };

  if (!activeAccount) {
    return <div>{t('dailyNotes.selectAccount')}</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        {!isEditing ? (
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => setIsEditing(true)}
            type="text"
          />
        ) : (
          <Space>
            <Button size="small" onClick={() => {
              setIsEditing(false);
              if (loadedPlan) {
                updateDailyNotes(loadedPlan.notes);
              }
            }}>{t('dailyNotes.cancel')}</Button>
            <Button 
              type="primary" 
              size="small"
              icon={<SaveOutlined />}
              loading={isSaving}
              onClick={handleSave}
            >
              {t('dailyNotes.save')}
            </Button>
          </Space>
        )}
      </div>

      {isEditing ? (
        <TextArea
          rows={6}
          value={dailyNotes}
          onChange={(e) => updateDailyNotes(e.target.value)}
          placeholder={t('dailyNotes.placeholder')}
          autoFocus
          style={{
            fontSize: 14,
            background: widgetStyles.sectionCard.background,
            border: `1px solid ${token.colorBorderSecondary}`,
            color: widgetStyles.colors.textPrimary,
            flex: 1,
          }}
        />
      ) : (
        <div
          style={{ 
            flex: 1,
            padding: '12px',
            background: widgetStyles.sectionCard.background,
            border: widgetStyles.sectionCard.border,
            borderRadius: 6,
            cursor: 'pointer',
            whiteSpace: 'pre-wrap',
            fontSize: 14,
            lineHeight: 1.6,
            transition: 'all 0.2s',
            overflow: 'auto',
          }}
          onDoubleClick={() => setIsEditing(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = token.colorBorder;
            e.currentTarget.style.background = token.colorFillQuaternary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = token.colorBorderSecondary;
            e.currentTarget.style.background = widgetStyles.sectionCard.background;
          }}
        >
          <Text style={{ color: dailyNotes ? widgetStyles.colors.textPrimary : widgetStyles.colors.textTertiary }}>
            {dailyNotes || t('dailyNotes.emptyText')}
          </Text>
        </div>
      )}
    </div>
  );
};