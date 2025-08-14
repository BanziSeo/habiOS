import { Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRow } from '../types';
import type { GlobalToken } from 'antd/es/theme/interface';
import type { TFunction } from 'i18next';

const { Text } = Typography;

interface GetTableColumnsParams {
  token: GlobalToken;
  t: TFunction;
}

export const getTableColumns = ({
  token,
  t,
}: GetTableColumnsParams): ColumnsType<TableRow> => [
  {
    title: t('metricsTable.columns.categoryName', '지표명'),
    dataIndex: 'name',
    key: 'name',
    width: '50%',
    render: (text, record) => {
      // 카테고리 행
      if (record.isCategory) {
        return (
          <Text strong style={{ color: token.colorPrimary }}>
            {text}
          </Text>
        );
      }
      // 일반 메트릭 행 - 들여쓰기로 계층 표현
      return (
        <Text style={{ paddingLeft: 16 }}>
          {text}
        </Text>
      );
    },
  },
  {
    title: t('metricsTable.columns.value', '값'),
    dataIndex: 'value',
    key: 'value',
    width: '50%',
    align: 'right',
    render: (value, record) => {
      // 카테고리 행은 값이 없음
      if (record.isCategory) return null;
      
      return (
        <Text 
          strong 
          style={{ 
            color: record.color,
            fontSize: '0.9rem',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {value}
        </Text>
      );
    },
  },
];