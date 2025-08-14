import React from 'react';
import { Form, Col, ColorPicker, InputNumber, Select, Switch, Card, Slider } from 'antd';
import { formatColor } from '../../../../utils/colorUtils';

// 섹션 헤더 컴포넌트
interface SectionHeaderProps {
  title: string;
  style?: React.CSSProperties;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, style }) => (
  <h4 style={{ marginBottom: 16, ...style }}>{title}</h4>
);

// 색상 필드 컴포넌트
interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  span?: number;
}

export const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange, span = 8 }) => (
  <Col span={span}>
    <Form.Item label={label}>
      <ColorPicker
        value={value}
        onChange={(color) => onChange(formatColor(color))}
      />
    </Form.Item>
  </Col>
);

// 숫자 입력 필드 컴포넌트
interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  span?: number;
  disabled?: boolean;
}

export const NumberField: React.FC<NumberFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 100, 
  span = 8,
  disabled = false 
}) => (
  <Col span={span}>
    <Form.Item label={label}>
      <InputNumber
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(val) => onChange(val || min)}
        style={{ width: '100%' }}
      />
    </Form.Item>
  </Col>
);

// 선택 필드 컴포넌트
interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  span?: number;
}

export const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  span = 8 
}) => (
  <Col span={span}>
    <Form.Item label={label}>
      <Select
        value={value}
        onChange={onChange}
        style={{ width: '100%' }}
      >
        {options.map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  </Col>
);

// 스위치 필드 컴포넌트
interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  span?: number;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({ 
  label, 
  checked, 
  onChange, 
  span = 12 
}) => (
  <Col span={span}>
    <Form.Item label={label}>
      <Switch checked={checked} onChange={onChange} />
    </Form.Item>
  </Col>
);

// 슬라이더 필드 컴포넌트
interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  marks?: Record<number, string>;
  span?: number;
}

export const SliderField: React.FC<SliderFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 1, 
  step = 0.1, 
  marks,
  span = 8 
}) => (
  <Col span={span}>
    <Form.Item label={label}>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        marks={marks}
        onChange={onChange}
      />
    </Form.Item>
  </Col>
);

// 설정 섹션 래퍼 컴포넌트
interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const SettingSection: React.FC<SettingSectionProps> = ({ title, children, style }) => (
  <div style={{ marginBottom: 24, ...style }}>
    <SectionHeader title={title} />
    <Form layout="vertical">
      {children}
    </Form>
  </div>
);

// 카드 섹션 컴포넌트 (여러 설정을 그룹화할 때 사용)
interface CardSectionProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const CardSection: React.FC<CardSectionProps> = ({ title, children, style }) => (
  <Card size="small" title={title} style={{ marginBottom: 16, ...style }}>
    <Form layout="vertical">
      {children}
    </Form>
  </Card>
);

// 선 스타일 옵션 상수
export const LINE_STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' }
];

// 마커 모양 옵션 상수
export const MARKER_SHAPE_OPTIONS = [
  { value: 'arrowUp', label: 'Arrow Up' },
  { value: 'arrowDown', label: 'Arrow Down' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' }
];

// 마커 위치 옵션 상수
export const MARKER_POSITION_OPTIONS = [
  { value: 'aboveBar', label: 'Above Bar' },
  { value: 'belowBar', label: 'Below Bar' },
  { value: 'inBar', label: 'In Bar' }
];