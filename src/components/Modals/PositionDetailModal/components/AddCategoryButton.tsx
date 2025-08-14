import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface AddCategoryButtonProps {
  onAdd: () => void;
  styles: {
    addButton: React.CSSProperties;
    [key: string]: React.CSSProperties;
  };
}

export const AddCategoryButton: React.FC<AddCategoryButtonProps> = ({
  onAdd,
  styles
}) => {
  return (
    <div style={styles.addButton}>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onAdd}
        block
      >
        Add Category
      </Button>
    </div>
  );
};