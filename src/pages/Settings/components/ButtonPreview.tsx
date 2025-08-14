import React from 'react';
import { Card, Space, Typography, Divider, theme } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SettingOutlined,
  ReloadOutlined,
  SaveOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  MoreOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { AppButton } from '../../../components/Common/AppButton';

const { Title, Text, Paragraph } = Typography;

export const ButtonPreview: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <Title level={2}>버튼 디자인 시스템</Title>
      <Paragraph type="secondary">
        TradesLog 앱의 통일된 버튼 스타일 프리뷰
      </Paragraph>

      <Divider />

      {/* Primary 버튼 */}
      <Card title="1. Primary (주요 액션)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">저장, 확인, 추가 등 주요 액션에 사용</Text>
          <Space wrap>
            <AppButton variant="primary">저장</AppButton>
            <AppButton variant="primary" icon={<SaveOutlined />}>저장</AppButton>
            <AppButton variant="primary" size="large">큰 버튼</AppButton>
            <AppButton variant="primary" size="small">작은 버튼</AppButton>
            <AppButton variant="primary" disabled>비활성화</AppButton>
            <AppButton variant="primary" loading>로딩중</AppButton>
          </Space>
        </Space>
      </Card>

      {/* Secondary 버튼 */}
      <Card title="2. Secondary (보조 액션)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">취소, 닫기, 되돌리기 등에 사용</Text>
          <Space wrap>
            <AppButton variant="secondary">취소</AppButton>
            <AppButton variant="secondary" icon={<CloseOutlined />}>닫기</AppButton>
            <AppButton variant="secondary" size="large">큰 버튼</AppButton>
            <AppButton variant="secondary" size="small">작은 버튼</AppButton>
            <AppButton variant="secondary" disabled>비활성화</AppButton>
          </Space>
        </Space>
      </Card>

      {/* Compact 버튼 */}
      <Card title="3. Compact (좁은 공간용)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">테이블, 리스트 내부의 작은 액션 버튼</Text>
          <Space wrap>
            <AppButton variant="compact">편집</AppButton>
            <AppButton variant="compact">상세보기</AppButton>
            <AppButton variant="compact" icon={<EditOutlined />}>수정</AppButton>
            <AppButton variant="compact" danger>삭제</AppButton>
          </Space>
          <div style={{ 
            padding: 12, 
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: 4
          }}>
            <Text>테이블 행 예시: </Text>
            <Space size={4} style={{ marginLeft: 'auto', float: 'right' }}>
              <AppButton variant="compact">Edit</AppButton>
              <AppButton variant="compact" danger>Delete</AppButton>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Icon 버튼 */}
      <Card title="4. Icon (아이콘 전용)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">툴바, 설정 등 아이콘만 있는 버튼</Text>
          <Space wrap>
            <AppButton variant="icon" icon={<PlusOutlined />} title="추가" />
            <AppButton variant="icon" icon={<EditOutlined />} title="편집" />
            <AppButton variant="icon" icon={<DeleteOutlined />} title="삭제" />
            <AppButton variant="icon" icon={<SettingOutlined />} title="설정" />
            <AppButton variant="icon" icon={<ReloadOutlined />} title="새로고침" />
            <AppButton variant="icon" icon={<MoreOutlined />} title="더보기" />
          </Space>
        </Space>
      </Card>

      {/* IconText 버튼 */}
      <Card title="5. Icon + Text (아이콘과 텍스트)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">명확한 액션 표시가 필요할 때</Text>
          <Space wrap>
            <AppButton variant="iconText" icon={<PlusOutlined />}>새 항목</AppButton>
            <AppButton variant="iconText" icon={<DownloadOutlined />}>다운로드</AppButton>
            <AppButton variant="iconText" icon={<ReloadOutlined />}>새로고침</AppButton>
            <AppButton variant="iconText" icon={<SettingOutlined />}>설정</AppButton>
          </Space>
        </Space>
      </Card>

      {/* Danger 버튼 */}
      <Card title="6. Danger (위험한 액션)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">삭제, 제거 등 되돌릴 수 없는 액션</Text>
          <Space wrap>
            <AppButton variant="danger">삭제</AppButton>
            <AppButton variant="danger" icon={<DeleteOutlined />}>영구 삭제</AppButton>
            <AppButton variant="compact" danger>Remove</AppButton>
            <AppButton variant="secondary" danger>모두 삭제</AppButton>
          </Space>
        </Space>
      </Card>

      {/* Ghost 버튼 */}
      <Card title="7. Ghost (투명 배경)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">배경과 자연스럽게 어울려야 할 때</Text>
          <div style={{ padding: 16, background: token.colorBgLayout, borderRadius: 4 }}>
            <Space wrap>
              <AppButton variant="ghost">더보기</AppButton>
              <AppButton variant="ghost" icon={<MoreOutlined />}>옵션</AppButton>
              <AppButton variant="ghost" size="small">필터</AppButton>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Minimal 버튼 */}
      <Card title="8. Minimal (최소 스타일)" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Text type="secondary">정보, 도움말 등 아주 작은 버튼</Text>
          <Space wrap align="center">
            <AppButton variant="minimal">i</AppButton>
            <AppButton variant="minimal">?</AppButton>
            <AppButton variant="minimal" icon={<QuestionCircleOutlined />} />
            <Text>인라인 텍스트와 <AppButton variant="minimal">작은 버튼</AppButton> 함께 사용</Text>
          </Space>
        </Space>
      </Card>

      {/* 실제 사용 예시 */}
      <Card title="실제 사용 예시" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* 모달 하단 */}
          <div>
            <Text strong>모달 하단 버튼:</Text>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Space>
                <AppButton variant="secondary">취소</AppButton>
                <AppButton variant="primary">확인</AppButton>
              </Space>
            </div>
          </div>

          {/* 툴바 */}
          <div>
            <Text strong>툴바:</Text>
            <div style={{ 
              marginTop: 12, 
              padding: 8, 
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: 4
            }}>
              <Space>
                <AppButton variant="icon" icon={<PlusOutlined />} />
                <AppButton variant="icon" icon={<EditOutlined />} />
                <AppButton variant="icon" icon={<DeleteOutlined />} />
                <Divider type="vertical" />
                <AppButton variant="icon" icon={<ReloadOutlined />} />
                <AppButton variant="icon" icon={<SettingOutlined />} />
              </Space>
            </div>
          </div>

          {/* 폼 액션 */}
          <div>
            <Text strong>폼 액션:</Text>
            <div style={{ marginTop: 12 }}>
              <Space>
                <AppButton variant="ghost">초기화</AppButton>
                <AppButton variant="secondary">임시 저장</AppButton>
                <AppButton variant="primary" icon={<SaveOutlined />}>저장</AppButton>
              </Space>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};