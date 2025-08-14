import { useState } from 'react';
import { Modal, Form, Input, Select, Button, Space, Dropdown, App } from 'antd';
import { DeleteOutlined, CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTradingStore } from '../../../stores/tradingStore';
import type { Account } from '../../../types';

const { Option } = Select;

interface AccountManagerProps {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  isModalVisible,
  setIsModalVisible,
}) => {
  const { t } = useTranslation('common');
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { loadAccounts, setActiveAccount } = useTradingStore();

  // 새 계좌 생성 핸들러
  const handleCreateAccount = async (values: { 
    name: string; 
    accountType: 'US' | 'KR'; 
    currency: 'USD' | 'KRW'; 
  }) => {
    setLoading(true);
    try {
      await window.electronAPI.account.create({
        name: values.name,
        accountType: values.accountType,
        currency: values.currency,
        initialBalance: 0, // CSV import 시 자산 입력하므로 기본값 0
      });
      
      message.success(t('account.createSuccess'));
      form.resetFields();
      setIsModalVisible(false);
      
      // 계정 목록 다시 로드
      const updatedAccounts = await loadAccounts();
      
      // 새로 생성된 계정 찾기 (가장 최근 생성된 계정)
      const newAccount = updatedAccounts.find(acc => acc.name === values.name);
      
      if (newAccount) {
        // 새 계정으로 자동 전환
        setActiveAccount(newAccount);
        // 데이터 다시 로드 (새 계정 데이터는 비어있어야 함)
        await window.location.reload(); // 전체 앱 새로고침으로 확실히 초기화
      }
    } catch (error) {
      message.error(t('message.error'));
    } finally {
      setLoading(false);
    }
  };


  // 계좌 생성 모달
  return (
    <Modal
      title={t('account.create')}
      open={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        form.resetFields();
      }}
      footer={[
        <Button 
          key="back" 
          onClick={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
        >
          {t('cancel')}
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={() => form.submit()}
        >
          {t('create')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateAccount}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label={t('account.accountName')}
          rules={[{ required: true, message: t('account.accountNameRequired') }]}
        >
          <Input placeholder={t('account.accountNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="accountType"
          label={t('account.accountType')}
          rules={[{ required: true, message: t('account.accountTypeRequired') }]}
        >
          <Select placeholder={t('account.accountTypePlaceholder')}>
            <Option value="US">{t('account.accountTypeUS')}</Option>
            <Option value="KR">{t('account.accountTypeKR')}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="currency"
          label={t('account.currency')}
          rules={[{ required: true, message: t('account.currencyRequired') }]}
        >
          <Select placeholder={t('account.currencyPlaceholder')}>
            <Option value="USD">USD ($)</Option>
            <Option value="KRW">KRW (₩)</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// 계좌 드롭다운 메뉴 컴포넌트
export const AccountDropdownMenu: React.FC = () => {
  const { t } = useTranslation('common');
  const { message, modal } = App.useApp();
  const { activeAccount, accounts, setActiveAccount, loadAccounts } = useTradingStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectAccount = (account: Account) => {
    setActiveAccount(account);
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    console.log('Attempting to delete account:', accountId, accountName);
    
    modal.confirm({
      title: t('account.deleteConfirm'),
      content: t('account.deleteConfirmContent', { name: accountName }),
      okText: t('button.delete'),
      cancelText: t('button.cancel'),
      okButtonProps: { danger: true },
      async onOk() {
        try {
          console.log('Calling delete API for account:', accountId);
          const result = await window.electronAPI.account.delete(accountId);
          console.log('Delete result:', result);
          
          message.success(t('account.deleteSuccess'));
          
          // 계정 목록 다시 로드
          const updatedAccounts = await loadAccounts();
          
          // 삭제한 계정이 활성 계정이었다면 첫 번째 계정으로 전환
          if (activeAccount?.id === accountId && updatedAccounts.length > 0) {
            setActiveAccount(updatedAccounts[0]);
            window.location.reload();
          }
        } catch (error) {
          console.error('Delete failed:', error);
          const errorMessage = error instanceof Error ? error.message : t('account.deleteFailed');
          message.error(errorMessage);
        }
      },
    });
  };


  const accountMenuItems = [
    ...accounts.map(account => ({
      key: account.id,
      label: (
        <Dropdown
          trigger={['contextMenu']}
          overlayStyle={{ zIndex: 1050 }}
          menu={{
            items: [
              {
                key: 'delete',
                label: t('button.delete'),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  handleDeleteAccount(account.id, account.name);
                },
              },
            ],
          }}
        >
          <Space style={{ width: '100%', cursor: 'pointer' }}>
            {activeAccount?.id === account.id && <CheckOutlined />}
            <span>{account.name}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.5 }}>
              {account.currency === 'KRW' ? '₩' : '$'}
            </span>
          </Space>
        </Dropdown>
      ),
      onClick: () => handleSelectAccount(account),
    })),
    {
      type: 'divider' as const,
    },
    {
      key: 'new',
      label: t('account.create'),
      icon: <PlusOutlined />,
      onClick: () => setIsModalVisible(true),
    },
  ];

  return (
    <>
      <Dropdown menu={{ items: accountMenuItems }}>
        <Button>
          {activeAccount ? activeAccount.name : t('account.select')}
        </Button>
      </Dropdown>
      <AccountManager 
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </>
  );
};