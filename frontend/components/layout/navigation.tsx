'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAppStore } from '@/lib/store';
import { logout } from '@/api/auth';
import { useT, useI18nStore } from '@/lib/i18n';
import PersonalInfoDialog from '@/components/common/personal-info-dialog';

const NO_NAV_PATHS = ['/login', '/register'];

export default function Navigation() {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const t = useT();
  const { locale, setLocale } = useI18nStore();
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false);

  if (NO_NAV_PATHS.includes(pathname)) return null;

  const isApplicantOnly =
    currentUser?.roles?.length === 1 && currentUser.roles[0].name === 'Applicant';

  const menuItems = [
    ...(isApplicantOnly ? [{
      key: 'personal-info',
      icon: <IdcardOutlined />,
      label: t.applicant.personal_info,
      onClick: () => setPersonalInfoOpen(true),
    }] : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t.nav.logout,
      onClick: () => logout(false),
    },
  ];

  return (
    <>
    <nav className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <Link href="/" className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
        PartnerHub
      </Link>
      <Space size={12} align="center">
        <Space size={6}>
          <Button
            size="small"
            type={locale === 'en' ? 'primary' : 'default'}
            onClick={() => setLocale('en')}
          >
            EN
          </Button>
          <Button
            size="small"
            type={locale === 'fr' ? 'primary' : 'default'}
            onClick={() => setLocale('fr')}
          >
            FR
          </Button>
        </Space>
        {currentUser && (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
            <Button type="text" icon={<UserOutlined />}>
              {currentUser.email}
            </Button>
          </Dropdown>
        )}
      </Space>
    </nav>
    {isApplicantOnly && (
      <PersonalInfoDialog open={personalInfoOpen} onClose={() => setPersonalInfoOpen(false)} />
    )}
    </>
  );
}
