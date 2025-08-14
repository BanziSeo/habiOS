# AppButton 디자인 시안

## 버튼 프리셋 종류

### 1. Primary (주요 액션)
```tsx
<AppButton variant="primary">저장</AppButton>
```
- **용도**: 저장, 확인, 추가 등 주요 액션
- **스타일**: 
  - 배경: 파란색 (theme.colorPrimary)
  - 텍스트: 흰색
  - 크기: middle (32px 높이)
  - 패딩: 8px 16px
  - 호버: 밝은 파란색

### 2. Secondary (보조 액션)
```tsx
<AppButton variant="secondary">취소</AppButton>
```
- **용도**: 취소, 닫기, 되돌리기 등
- **스타일**:
  - 배경: 투명
  - 테두리: 회색 (theme.colorBorder)
  - 텍스트: 기본 색상
  - 크기: middle (32px 높이)
  - 패딩: 8px 16px
  - 호버: 연한 회색 배경

### 3. Compact (좁은 공간용)
```tsx
<AppButton variant="compact">Edit</AppButton>
```
- **용도**: 테이블, 리스트 내부의 작은 버튼
- **스타일**:
  - 배경: 투명
  - 텍스트: 링크 색상
  - 크기: small (24px 높이)
  - 패딩: 4px 8px (컴팩트)
  - 호버: 텍스트 진하게

### 4. Icon (아이콘 전용)
```tsx
<AppButton variant="icon" icon={<SettingOutlined />} />
```
- **용도**: 설정, 메뉴, 액션 아이콘
- **스타일**:
  - 배경: 투명
  - 크기: small (24px x 24px)
  - 패딩: 4px
  - 호버: 연한 회색 배경
  - 원형 또는 사각형 선택 가능

### 5. Icon with Text (아이콘 + 텍스트)
```tsx
<AppButton variant="iconText" icon={<PlusOutlined />}>추가</AppButton>
```
- **용도**: 명확한 액션 표시
- **스타일**:
  - 배경: 투명 또는 연한 배경
  - 크기: small (28px 높이)
  - 패딩: 4px 12px
  - 아이콘-텍스트 간격: 4px

### 6. Danger (위험한 액션)
```tsx
<AppButton variant="danger">삭제</AppButton>
```
- **용도**: 삭제, 제거 등 되돌릴 수 없는 액션
- **스타일**:
  - 배경: 투명
  - 텍스트: 빨간색 (theme.colorError)
  - 크기: small
  - 호버: 연한 빨간색 배경

### 7. Ghost (투명 배경)
```tsx
<AppButton variant="ghost">더보기</AppButton>
```
- **용도**: 배경과 자연스럽게 어울려야 할 때
- **스타일**:
  - 배경: 완전 투명
  - 테두리: 없음
  - 텍스트: 연한 색상
  - 호버: 텍스트만 진하게

### 8. Minimal (최소한의 스타일)
```tsx
<AppButton variant="minimal">i</AppButton>
```
- **용도**: 정보, 도움말 등 미니멀한 버튼
- **스타일**:
  - 크기: 16px x 16px (아주 작음)
  - 패딩: 2px
  - 폰트: 12px
  - 테두리/배경: 상황에 따라

## 크기 옵션 (모든 variant에 적용 가능)
```tsx
<AppButton variant="primary" size="large">큰 버튼</AppButton>
<AppButton variant="primary" size="middle">중간 버튼</AppButton>
<AppButton variant="primary" size="small">작은 버튼</AppButton>
```

## 상태별 스타일
- **Default**: 기본 상태
- **Hover**: 마우스 오버 시 살짝 밝게
- **Active**: 클릭 시 살짝 어둡게
- **Disabled**: 투명도 0.5, 커서 not-allowed
- **Loading**: 스피너 표시

## 실제 사용 예시

### 모달 하단
```tsx
<Space>
  <AppButton variant="secondary">취소</AppButton>
  <AppButton variant="primary">확인</AppButton>
</Space>
```

### 테이블 액션
```tsx
<Space size={4}>
  <AppButton variant="compact">수정</AppButton>
  <AppButton variant="compact" danger>삭제</AppButton>
</Space>
```

### 툴바
```tsx
<Space>
  <AppButton variant="icon" icon={<PlusOutlined />} title="추가" />
  <AppButton variant="icon" icon={<ReloadOutlined />} title="새로고침" />
  <AppButton variant="icon" icon={<SettingOutlined />} title="설정" />
</Space>
```

### 위젯 헤더
```tsx
<AppButton variant="ghost" size="small">
  <MoreOutlined />
</AppButton>
```

## 다크 테마 대응
모든 버튼은 자동으로 다크/라이트 테마에 맞춰 색상 조정:
- 다크 모드: 배경색 어둡게, 테두리 연하게
- 라이트 모드: 기본 Ant Design 색상

## 구현 코드 예시
```typescript
interface AppButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'compact' | 'icon' | 'iconText' | 'danger' | 'ghost' | 'minimal';
  size?: 'large' | 'middle' | 'small';
}

const AppButton: React.FC<AppButtonProps> = ({ 
  variant = 'primary', 
  size,
  danger,
  ...props 
}) => {
  const presets = {
    primary: {
      type: 'primary',
      size: size || 'middle',
    },
    secondary: {
      type: 'default',
      size: size || 'middle',
    },
    compact: {
      type: 'link',
      size: size || 'small',
      style: { padding: '4px 8px', height: 'auto' }
    },
    icon: {
      type: 'text',
      size: size || 'small',
      shape: 'circle',
      style: { padding: 4 }
    },
    iconText: {
      type: 'text',
      size: size || 'small',
      style: { padding: '4px 12px' }
    },
    danger: {
      type: 'link',
      danger: true,
      size: size || 'small',
    },
    ghost: {
      type: 'ghost',
      size: size || 'small',
    },
    minimal: {
      type: 'text',
      size: size || 'small',
      style: { 
        minWidth: 'auto', 
        padding: '2px 4px', 
        height: 'auto',
        fontSize: '12px' 
      }
    }
  };

  return <Button {...presets[variant]} danger={danger} {...props} />;
};
```