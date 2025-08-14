import { useEffect } from 'react';
import { App } from 'antd';
import { TIMEFRAME_OPTIONS } from '../constants';
import type { ChartSettings } from '../../../../stores/settings/types';

interface UseChartShortcutsProps {
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  handleCapture: () => void;
  chartSettings: ChartSettings;
  getTimeframeByShortcut: (key: string) => string | undefined;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useChartShortcuts = ({
  selectedTimeframe,
  setSelectedTimeframe,
  handleCapture,
  chartSettings,
  getTimeframeByShortcut,
  containerRef
}: UseChartShortcutsProps) => {
  const { message } = App.useApp();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // input, textarea 등에서 타이핑 중이면 무시
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // 캡쳐 단축키 확인
      if (e.key === (chartSettings.captureShortcut || '`') && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        handleCapture();
        return;
      }
      
      // 타임프레임 단축키는 modifier 키 없이만 작동
      // (chart-0714의 다른 단축키들이 작동하도록 함)
      if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
        return;
      }
      
      const key = e.key.toLowerCase();
      const timeframe = getTimeframeByShortcut(key);
      
      if (timeframe && timeframe !== selectedTimeframe) {
        setSelectedTimeframe(timeframe);
        message.success(`${TIMEFRAME_OPTIONS.find(tf => tf.value === timeframe)?.label || timeframe}로 전환`);
        // 이벤트 전파 중단하여 다른 핸들러가 처리하지 못하도록 함
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // 차트 컨테이너에 포커스가 있을 때만 작동
    const container = containerRef.current;
    if (container) {
      // 컨테이너가 포커스를 받을 수 있도록 tabIndex 설정
      container.tabIndex = -1;
      container.addEventListener('keydown', handleKeyPress);
      
      // 컴포넌트 마운트 시 자동으로 포커스
      container.focus();
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyPress);
      }
    };
  }, [selectedTimeframe, setSelectedTimeframe, handleCapture, chartSettings.captureShortcut, getTimeframeByShortcut, message, containerRef]);
};