import React, { useState, useEffect, useRef } from 'react';
import { 
  Button,
  message,
  Tooltip,
  theme,
} from 'antd';
import { 
  ReloadOutlined,
  SettingOutlined,
  LineChartOutlined,
  EyeOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';
import { ChartSettings } from './components/ChartSettings';
import { GeneralSettings } from './components/GeneralSettings';
import { DataManagement } from './components/DataManagement';
import { ChartModal } from '../../components/Modals/ChartModal';
import { ShortcutSettings } from './components/ShortcutSettings';
import { createDummyPosition } from '../../utils/dummyData';
import { useChartData } from '../../components/Modals/ChartModal/hooks/useChartData';
import type { Position } from '../../types';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation('settings');
  const { 
    resetToDefaults
  } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('chart');
  const [settingsPanelWidth, setSettingsPanelWidth] = useState(50); // 퍼센트
  const [chartPreviewHeight, setChartPreviewHeight] = useState(50); // 퍼센트
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResetToDefaults = () => {
    resetToDefaults();
    message.success(t('messages.resetSuccess'));
  };

  // 키보드 단축키 핸들러
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + 화살표로 패널 크기 조절
      if (e.ctrlKey && activeTab === 'chart') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setSettingsPanelWidth(prev => Math.max(30, prev - 5));
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setSettingsPanelWidth(prev => Math.min(70, prev + 5));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setChartPreviewHeight(prev => Math.min(80, prev + 5));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setChartPreviewHeight(prev => Math.max(20, prev - 5));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // 세로 리사이징 핸들러 (마우스는 유지)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isVerticalResizing && containerRef.current) {
        const previewPanel = containerRef.current.querySelector('.preview-panel');
        if (previewPanel) {
          const panelHeight = previewPanel.clientHeight;
          const offsetTop = previewPanel.getBoundingClientRect().top;
          const relativeY = e.clientY - offsetTop;
          const newPercentage = (relativeY / panelHeight) * 100;
          if (newPercentage > 20 && newPercentage < 80) {
            setChartPreviewHeight(newPercentage);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsVerticalResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isVerticalResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isVerticalResizing]);

  const setQuickHeight = (height: number) => {
    setChartPreviewHeight(height);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chart':
        return <ChartSettings />;
      case 'general':
        return <GeneralSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-wrapper">
      {/* 통합 헤더 */}
      <div 
        className="settings-header"
        style={{
          borderBottom: `1px solid ${token.colorBorder}`,
          background: token.colorBgContainer,
        }}
      >
        <h1 
          className="header-title"
          style={{ color: token.colorText }}
        >
          {t('title')}
        </h1>
        <div className="header-actions">
          <Tooltip title={t('actions.resetTooltip')}>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleResetToDefaults}
              style={{
                color: token.colorTextSecondary,
              }}
            />
          </Tooltip>
        </div>
      </div>
      
      {/* 메인 컨테이너 */}
      <div className="settings-container" ref={containerRef}>
        {/* 설정 패널 (좌측) */}
        <div 
          className="settings-panel"
          style={{ 
            flex: `0 0 ${settingsPanelWidth}%`,
            borderRight: `1px solid ${token.colorBorder}`,
          }}
        >
          {/* 탭 네비게이션 */}
          <div 
            className="tab-navigation"
            style={{
              background: token.colorBgContainer,
            }}
          >
          <div 
            className={`tab-item ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
            style={{
              ...(activeTab === 'chart' && {
                color: token.colorPrimary,
                borderBottomColor: token.colorPrimary,
              })
            }}
          >
            <LineChartOutlined className="tab-icon" />
            {t('tabs.chart')}
          </div>
          <div 
            className={`tab-item ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <SettingOutlined className="tab-icon" />
            {t('tabs.general')}
          </div>
        </div>
        
        {/* 설정 콘텐츠 */}
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
      
      {/* 프리뷰 패널 (우측) */}
      {activeTab === 'chart' ? (
        <>
          <Tooltip 
            title={t('preview.resizeTip')} 
            placement="right"
          >
            <div className="resize-divider" />
          </Tooltip>
          <div className="preview-panel">
          
          {/* 차트 영역 (높이 조절 가능) */}
          <div 
            className="chart-wrapper"
            style={{ height: `${chartPreviewHeight}%` }}
          >
            <div className="preview-header">
              <div className="preview-title">
                <EyeOutlined />
                {t('preview.title')}
              </div>
              <div className="preview-controls">
                <div className="preview-size-indicator">
                  <span>{t('preview.height')}</span>
                  <button 
                    className={`size-btn ${chartPreviewHeight <= 35 ? 'active' : ''}`}
                    onClick={() => setQuickHeight(30)}
                  >
                    30%
                  </button>
                  <button 
                    className={`size-btn ${chartPreviewHeight > 35 && chartPreviewHeight <= 60 ? 'active' : ''}`}
                    onClick={() => setQuickHeight(50)}
                  >
                    50%
                  </button>
                  <button 
                    className={`size-btn ${chartPreviewHeight > 60 ? 'active' : ''}`}
                    onClick={() => setQuickHeight(70)}
                  >
                    70%
                  </button>
                </div>
                <Button 
                  icon={<ExpandOutlined />} 
                  size="small"
                  title={t('actions.fullscreen')}
                />
              </div>
            </div>
            
            <div className="preview-content">
              <SettingsChartPreview />
            </div>
            
            {/* 세로 리사이즈 핸들 */}
            <Tooltip 
              title={t('preview.resizeTip').replace('← →', '↑ ↓').replace('패널 크기', '차트 높이')} 
              placement="top"
            >
              <div 
                className="resize-handle resize-handle-vertical"
                onMouseDown={() => {
                  setIsVerticalResizing(true);
                  document.body.style.cursor = 'row-resize';
                }}
              />
            </Tooltip>
          </div>
          
          {/* 설정 상세 영역 - 단축키 설정 */}
          <div className="settings-detail">
            <ShortcutSettings />
          </div>
          </div>
        </>
      ) : activeTab === 'general' ? (
        <>
          <Tooltip 
            title={t('preview.resizeTip')} 
            placement="right"
          >
            <div className="resize-divider" />
          </Tooltip>
          <div className="preview-panel" style={{ padding: '20px' }}>
            <DataManagement />
          </div>
        </>
      ) : null}
      </div>
    </div>
  );
};

// 설정 페이지용 차트 미리보기 컴포넌트
const SettingsChartPreview: React.FC = () => {
  const { t } = useTranslation('settings');
  const ticker = 'SPY';
  const timeframe = '1d';
  const { chartData } = useChartData(ticker, timeframe);
  const [dummyPosition, setDummyPosition] = useState<Position | null>(null);
  
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      const currentPrice = chartData[chartData.length - 1].close;
      const position = createDummyPosition(ticker, currentPrice, chartData);
      setDummyPosition(position);
    }
  }, [chartData]);
  
  if (!dummyPosition) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span>{t('preview.loading')}</span>
      </div>
    );
  }
  
  return (
    <ChartModal
      position={dummyPosition}
      isPreview={true}
    />
  );
};

export default SettingsPage;