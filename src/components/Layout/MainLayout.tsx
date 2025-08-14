import { Layout, Menu, Dropdown, Button, Space, App, theme, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  GoogleOutlined,
  PlusOutlined,
  CheckOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppRouter } from '../../router';
import { useTradingStore } from '../../stores/tradingStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { useHelpStore } from '../../stores/helpStore';
import { useResponsive } from '../../hooks/useResponsive';
import type { Account } from '../../types';
import { AccountManager, AccountDropdownMenu } from './components/AccountManager';
import { NavigationMenu } from './components/NavigationMenu';
import habiOSIconSvg from '../../assets/habios-icon.svg';
import habiOSLogoSvg from '../../assets/habios-logo-horizontal.svg';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const { t } = useTranslation(['common', 'messages']);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { loadAccounts, setActiveAccount, activeAccount, accounts } = useTradingStore();
  const { getMenuByShortcut } = useSettingsStore();
  const { isAuthenticated, user, checkAuth, logout } = useAuthStore();
  const { isHelpMode, toggleHelpMode } = useHelpStore();
  const responsive = useResponsive();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true' || responsive.isCompact;
  });

  useEffect(() => {
    loadAccounts();
    checkAuth(); // 앱 시작 시 인증 상태 확인
  }, [loadAccounts, checkAuth]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

  // Auto-collapse on small screens
  useEffect(() => {
    if (responsive.isCompact && !collapsed) {
      setCollapsed(true);
    }
  }, [responsive.isCompact]);

  // 메뉴 단축키 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl, Alt, Shift 등의 modifier key가 눌려있으면 무시
      if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
      
      // input, textarea 등에서 입력 중이면 무시
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') return;

      // 설정된 메뉴 단축키 확인
      const menuShortcut = getMenuByShortcut(e.key);
      if (menuShortcut) {
        navigate(menuShortcut.menu);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, getMenuByShortcut]);



  // 계좌 선택 핸들러
  const handleSelectAccount = (account: Account) => {
    setActiveAccount(account);
    message.success(t('account.switchSuccess', { name: account.name }));
  };

  // 계정 관리 드롭업 메뉴
  const accountManagementMenu = {
    items: [
      isAuthenticated && user ? {
        key: 'discord-user',
        label: (
          <Space>
            <CheckOutlined style={{ color: token.colorSuccess }} />
            <span>{user.username}</span>
          </Space>
        ),
        icon: <MessageOutlined />,
        children: [
          {
            key: 'logout',
            label: t('messages:account.logout'),
            onClick: async () => {
              await logout();
              message.info(t('messages:account.loggedOut'));
            },
          },
        ],
      } : {
        key: 'discord',
        label: t('messages:account.discordLogin'),
        icon: <MessageOutlined />,
        onClick: async () => {
          // Discord OAuth 시작
          const result = await window.electronAPI.auth.loginDiscord();
          if (result.success && result.user) {
            const authStore = useAuthStore.getState();
            authStore.setUser(result.user);
            message.success(t('messages:account.welcomeUser', { username: result.user.username }));
          } else {
            message.error(result.error || t('messages:account.loginFailed'));
          }
        },
      },
      {
        key: 'google',
        label: t('messages:account.googleLogin'),
        icon: <GoogleOutlined />,
        disabled: true,
      },
      {
        key: 'accounts',
        label: t('common:navigation.account'),
        icon: <UserOutlined />,
        children: [
          ...accounts.map(account => ({
            key: account.id,
            label: (
              <Space style={{ width: '100%', cursor: 'pointer' }}>
                <span>{account.name}</span>
                {activeAccount?.id === account.id && <CheckOutlined />}
              </Space>
            ),
            onClick: () => handleSelectAccount(account),
          })),
          { type: 'divider' as const },
          {
            key: 'add-account',
            label: t('account.addAccount'),
            icon: <PlusOutlined />,
            onClick: () => setIsModalVisible(true),
          },
        ],
      },
      { type: 'divider' as const },
      {
        key: 'settings',
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>{t('navigation.settings')}</span>
          </div>
        ),
        icon: <SettingOutlined />,
        onClick: () => navigate('/settings'),
      },
    ],
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider 
        width={240}
        collapsedWidth={80}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ 
          height: 80, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {collapsed ? (
              <img src={habiOSIconSvg} alt="habiOS" style={{ width: 40, height: 40 }} />
            ) : (
              <img src={habiOSLogoSvg} alt="habiOS" style={{ width: 160, height: 48 }} />
            )}
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: 'absolute',
              bottom: 8,
              right: collapsed ? 24 : 16,
              fontSize: 16,
              transition: 'all 0.3s'
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
          <NavigationMenu collapsed={collapsed} />
          <Dropdown
            menu={accountManagementMenu}
            trigger={['click']}
            placement={collapsed ? "topRight" : "topLeft"}
          >
            <Menu
              mode="inline"
              selectedKeys={[]}
              items={[
                {
                  key: 'account-management',
                  icon: <UserOutlined style={{ fontSize: 18 }} />,
                  label: <span style={{ fontSize: 15, fontWeight: 500 }}>{t('messages:account.accountAndSettings')}</span>,
                  style: { borderTop: `1px solid ${token.colorBorderSecondary}` }
                }
              ]}
              style={{ 
                borderRight: 0,
              }}
            />
          </Dropdown>
        </div>
      </Sider>
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 240,
        transition: 'margin-left 0.2s',
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Header style={{ 
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          right: 0,
          left: collapsed ? 80 : 240,
          transition: 'left 0.2s',
          zIndex: 99
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <AccountDropdownMenu />
          </div>
          
          {/* 도움말 모드 토글 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <QuestionCircleOutlined style={{ fontSize: 16, opacity: 0.6 }} />
            <Switch
              checked={isHelpMode}
              onChange={toggleHelpMode}
              checkedChildren={t('helpMode.on')}
              unCheckedChildren={t('helpMode.off')}
              style={{ minWidth: 85 }}
            />
          </div>
        </Header>
        <Content style={{ 
          marginTop: 64,
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          padding: '24px'
        }}>
          <div style={{ 
            minHeight: '100%'
          }}>
            <AppRouter />
          </div>
        </Content>
      </Layout>

      {/* 계좌 관리 모달 */}
      <AccountManager
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </Layout>
  );
};

export default MainLayout;