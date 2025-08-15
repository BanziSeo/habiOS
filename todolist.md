# TODO List - habiOS

## ✅ 완료 - Discord OAuth 인증 문제 해결
- Node.js 내장 http 모듈로 localhost 서버 구현 완료
- Discord Developer Portal redirect URI를 `http://localhost:3000/auth/callback`로 변경
- 프로덕션 환경에서 정상 작동 확인

---

## ✅ 메뉴바 제거 (완료)

### 구현 내용
- `Menu.setApplicationMenu(null)`로 메뉴바 완전 제거
- 깔끔한 UI 구현
- `/electron/main.ts`에서 처리

### 향후 계획 (Optional)
나중에 필요시 커스텀 메뉴바 구현 예정:
- 매매일지 앱에 맞는 메뉴 구성
- Import/Export, Settings 등 핵심 기능만 포함
- 단축키와 연동

---

## ✅ 완료 - 달력 위젯 구현
- Ant Design Calendar 컴포넌트 활용한 위젯 완성
- 일별 손익 표시 기능 구현
- Journal 페이지에 추가 완료

---

## 🎯 Journal 페이지 개편 계획

### 개편 목표
- 2개의 독립적인 Journal 페이지 제공 (Journal_1, Journal_2)
- 사용자가 자유롭게 이름 커스터마이징 가능
- 프리셋 시스템으로 레이아웃 저장/불러오기
- Equity Curve를 위젯화하여 통합 대시보드 구현

### ✅ 1단계: Journal 메뉴 분리 (완료)
**목표**: 기존 Journal을 2개의 독립적인 페이지로 분리

#### 구현 방식
1. **폴더 구조**
   - `/src/pages/Journal` 폴더를 복사하여 `Journal1`, `Journal2` 생성
   - 각 폴더는 독립적인 컴포넌트와 훅 포함

2. **라우팅 설정** (`/src/router/index.tsx`)
   - `/journal1` → Journal1 컴포넌트
   - `/journal2` → Journal2 컴포넌트  
   - `/journal` → `/journal1`로 리다이렉트 (하위 호환성)
   - 기본 경로 `/` → `/journal1`로 리다이렉트

3. **localStorage 키 분리** (각 폴더의 `constants.ts`)
   - Journal1: `journal1WidgetLayouts`, `journal1HiddenWidgets`, `journal1HiddenCards`
   - Journal2: `journal2WidgetLayouts`, `journal2HiddenWidgets`, `journal2HiddenCards`

4. **네비게이션 메뉴** (`/src/components/Layout/components/NavigationMenu.tsx`)
   - Journal_1, Journal_2 메뉴 항목 추가
   - 아이콘: FileTextOutlined 사용

5. **페이지 제목** (각 폴더의 `components/JournalHeader.tsx`)
   - Journal1: "Journal_1" 표시
   - Journal2: "Journal_2" 표시

### ✅ 2단계: 메뉴 이름 커스터마이징 (완료)
**목표**: 사용자가 Journal 페이지 이름을 자유롭게 변경

#### 구현 방식
1. **페이지 상단 제목 클릭**
   - 인라인 편집 모드 활성화
   - Enter 키로 저장, ESC로 취소
   - 최대 글자수 제한 (20자)

2. **사이드바 메뉴명 편집**
   - 메뉴 호버 시 편집 아이콘 표시
   - 클릭하면 인라인 편집

3. **데이터 저장**
   - localStorage: `journal_custom_names`
   - 구조: `{ journal1: "트레이딩 대시보드", journal2: "분석 보드" }`

### ✅ 3단계: 프리셋 시스템 (완료)
**목표**: 현재 그리드 시스템 유지하면서 레이아웃 저장/불러오기

#### 구현 내용
1. **프리셋 저장/불러오기**
   - 드롭다운 UI로 프리셋 선택
   - 현재 레이아웃을 이름 지정하여 저장
   - 최대 10개 프리셋 저장 가능
   - 프리셋별 위젯 배치, 숨김 설정 모두 저장

2. **백업/복원 통합** 
   - Settings > Data 백업에 프리셋 데이터 포함
   - localStorage 데이터 자동 백업/복원
   - 커스텀 Journal 이름도 함께 저장

3. **파일 구조**
   - `/src/hooks/usePresets.ts` - 프리셋 관리 훅
   - `/src/pages/Journal1/components/PresetManager.tsx` - UI 컴포넌트
   - localStorage 키: `journal1_presets`, `journal2_presets`

### ✅ 4단계: Equity Curve 위젯화 (완료)
**목표**: 기존 Equity Curve 페이지를 위젯으로 변환

#### 구현 완료
1. **Full Equity Curve Widget**
   - 현재 페이지의 모든 기능 포함
   - 크기 조절 가능
   - 모달로 상세 차트 표시

2. **Mini Equity Curve Widget**
   - 라인 차트만 표시
   - 기간 선택 가능
   - 퍼센트/달러 표시 전환

#### 백업 처리
- 기존 Equity Curve 페이지는 `/src/pages/_backup/EquityCurve_backup_20250815/`로 백업
- 메뉴에서 제거됨

### 구현 우선순위 및 일정
1. **필수 기능** - 5-6시간
   - 1단계: Journal 분리 (30분)
   - 2단계: 이름 커스터마이징 (1시간)
   - 3단계: 프리셋 시스템 (2시간)
   - 4단계: Equity Curve 위젯화 (2-3시간)

2. **선택 기능 (Optional)**
   - 위젯 자유 배치 시스템 (하이브리드 방식)
   - 완전 자유 배치 모드
   - 스냅 그리드와 가이드라인

---

## 🎨 달력 위젯 UI/UX 개선

### ✅ 완료된 개선사항
- [x] 손익 표시 방식 개선 (통화/퍼센트 선택 가능)
- [x] 통화 기호 포맷팅 ($, ₩)
- [x] 히트맵 뷰 구현
- [x] 주간/월간 뷰 전환

### 📋 진행 예정 개선사항

#### 1. **히트맵 색상 커스터마이징**
- [ ] 컬러피커로 손실/수익 색상 선택
- [ ] 선택한 색상 기반 그라데이션 생성
- [ ] 설정에서 색상 변경 가능

#### 2. **히트맵 방향 설정**
- [ ] 가로/세로 방향 선택 옵션
- [ ] 가로 방향이 더 직관적
- [ ] 설정에서 변경 가능

#### 3. **캘린더 위젯 최소 너비**
- [ ] 현재 최소 너비 축소
- [ ] 세로 히트맵 사용자를 위한 개선

#### 4. **포지션 통계 개선**
- [ ] 거래 횟수 → 포지션 수로 변경
- [ ] 신규 오픈 포지션 수
- [ ] 클로즈된 포지션 수
- [ ] 더 의미있는 데이터 제공

#### 5. **히트맵 날짜 레이블**
- [ ] "최근 X주" → 실제 날짜 범위 표시
- [ ] 예: "1/1 - 1/14" 형식
- [ ] 네비게이션 시에도 정확한 기간 표시

### 예상 작업 시간
- 색상 커스터마이징: 1시간
- 방향 설정: 30분
- 최소 너비 조정: 15분
- 포지션 통계: 1시간
- 날짜 레이블: 30분

---

## 📝 기타 TODO

### 기능 개선
- [ ] 앱 크기 최적화 (현재 1.25GB → 목표 300MB)

### 버그 수정
- [x] 로그인 화면 버전 텍스트 변경 (habiOS v0.8.15)
- [x] electron-builder.json 파일 정리 (불필요한 파일 제거)

### 문서화
- [ ] Discord OAuth 문제 및 해결 과정 문서화
- [ ] 배포 가이드 작성