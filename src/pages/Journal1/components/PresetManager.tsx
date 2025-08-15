import React, { useState } from 'react';
import { Select, Button, Modal, Input, message, Space, Divider } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePresets } from '../../../hooks/usePresets';
import type { LayoutItem } from '../types';

const { Option, OptGroup } = Select;

interface PresetManagerProps {
  journalId: 'journal1' | 'journal2';
  currentLayouts: LayoutItem[];
  hiddenWidgets: string[];
  hiddenMetricCards: string[];
  onLoadPreset: (layoutData: {
    widgetLayouts: LayoutItem[];
    hiddenWidgets: string[];
    hiddenMetricCards: string[];
  }) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  journalId,
  currentLayouts,
  hiddenWidgets,
  hiddenMetricCards,
  onLoadPreset
}) => {
  const { presets, userPresets, defaultTemplates, savePreset, deletePreset } = usePresets({ journalId });
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // 프리셋 저장
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      message.warning('프리셋 이름을 입력해주세요');
      return;
    }

    savePreset(presetName, {
      widgetLayouts: currentLayouts,
      hiddenWidgets,
      hiddenMetricCards
    });

    message.success(`'${presetName}' 프리셋이 저장되었습니다`);
    setSaveModalVisible(false);
    setPresetName('');
  };

  // 프리셋 불러오기
  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      onLoadPreset(preset.layoutData);
      message.success(`'${preset.name}' 프리셋을 불러왔습니다`);
      setSelectedPresetId(presetId);
    }
  };

  // 프리셋 삭제
  const handleDeletePreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const preset = presets.find(p => p.id === presetId);
    if (preset && !preset.isDefault) {
      Modal.confirm({
        title: '프리셋 삭제',
        content: `'${preset.name}' 프리셋을 삭제하시겠습니까?`,
        onOk: () => {
          deletePreset(presetId);
          message.success('프리셋이 삭제되었습니다');
          if (selectedPresetId === presetId) {
            setSelectedPresetId('');
          }
        }
      });
    }
  };

  return (
    <Space>
      <Select
        style={{ width: 200 }}
        placeholder="레이아웃 선택"
        value={selectedPresetId || undefined}
        onChange={handleLoadPreset}
        allowClear
        onClear={() => setSelectedPresetId('')}
      >
        {userPresets.length > 0 ? (
          <OptGroup label="내 프리셋">
            {userPresets.map(preset => (
                <Option key={preset.id} value={preset.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{preset.name}</span>
                    <DeleteOutlined
                      style={{ color: '#ff4d4f', fontSize: 12 }}
                      onClick={(e) => handleDeletePreset(preset.id, e)}
                    />
                  </div>
                </Option>
              ))}
          </OptGroup>
        ) : (
          <Option disabled value="">저장된 프리셋이 없습니다</Option>
        )}
      </Select>

      <Button
        icon={<SaveOutlined />}
        onClick={() => setSaveModalVisible(true)}
      >
        저장
      </Button>

      <Modal
        title="프리셋 저장"
        open={saveModalVisible}
        onOk={handleSavePreset}
        onCancel={() => {
          setSaveModalVisible(false);
          setPresetName('');
        }}
        okText="저장"
        cancelText="취소"
      >
        <Input
          placeholder="프리셋 이름 입력"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          maxLength={20}
          onPressEnter={handleSavePreset}
          autoFocus
        />
        <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
          최대 10개까지 저장 가능합니다. (현재: {userPresets.length}/10)
        </div>
      </Modal>
    </Space>
  );
};