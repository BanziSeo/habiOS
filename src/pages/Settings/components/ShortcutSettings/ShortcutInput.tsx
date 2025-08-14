import React from 'react';
import { Input, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface ShortcutInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'input' | 'select';
  options?: { label: string; value: string }[];
  placeholder?: string;
  singleKey?: boolean; // 단일 키만 받을지 여부
}

export const ShortcutInput: React.FC<ShortcutInputProps> = ({
  label,
  value,
  onChange,
  type = 'input',
  options = [],
  placeholder,
  singleKey = false,
}) => {
  const { t } = useTranslation('settings');
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    // singleKey 모드일 때
    if (singleKey) {
      // 단일 키만 받음 (수정자 키 무시)
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }
      onChange(e.key);
      return;
    }
    
    // 특수 키만 눌렀을 때는 무시
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }
    
    const keys: string[] = [];
    
    // 수정자 키 확인
    if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    
    // 실제 키
    let key = e.key;
    
    // 특수 키 이름 변환
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Escape': 'Esc',
      'Backspace': 'Backspace',
      'Delete': 'Delete',
      'Enter': 'Enter',
      'Tab': 'Tab',
    };
    
    if (keyMap[key]) {
      key = keyMap[key];
    } else if (key.length === 1) {
      // 일반 문자는 대문자로
      key = key.toUpperCase();
    }
    
    keys.push(key);
    
    // 키 조합 생성
    const shortcut = keys.join('+');
    onChange(shortcut);
  };
  
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="shortcut-input-item">
      {label && (
        <Text className="shortcut-input-label">{label}</Text>
      )}
      {type === 'select' ? (
        <Select
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          options={options}
          size="small"
          className="shortcut-select"
        />
      ) : (
        <Input
          value={value}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('shortcuts.menu.shortcutPlaceholder')}
          size="small"
          className="shortcut-input"
          readOnly
          allowClear
          onChange={(e) => {
            if (!e.target.value) {
              handleClear();
            }
          }}
        />
      )}
    </div>
  );
};