import React from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';

interface TradeTypeTagProps {
  type: 'BUY' | 'SELL';
  showFullText?: boolean; // true: 'BUY'/'SELL', false: 'B'/'S'
  showKorean?: boolean; // true: '매수'/'매도'
  style?: React.CSSProperties;
}

export const TradeTypeTag: React.FC<TradeTypeTagProps> = ({ 
  type, 
  showFullText = true,
  showKorean = false,
  style 
}) => {
  const { i18n } = useTranslation('common');
  const color = type === 'BUY' ? 'green' : 'red';
  
  let text: string;
  if (showKorean || i18n.language === 'ko') {
    text = type === 'BUY' ? '매수' : '매도';
  } else if (!showFullText) {
    text = type === 'BUY' ? 'B' : 'S';
  } else {
    text = type === 'BUY' ? 'Long' : 'Close';
  }
  
  return (
    <Tag color={color} style={style}>
      {text}
    </Tag>
  );
};