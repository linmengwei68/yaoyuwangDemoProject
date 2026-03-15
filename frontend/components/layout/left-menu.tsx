'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'antd';
import { HomeOutlined, TeamOutlined } from '@ant-design/icons';
import { useAppStore } from '@/lib/store';
import { useT } from '@/lib/i18n';

const NO_MENU_PATHS = ['/login', '/register'];

export default function LeftMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useT();
  const currentUser = useAppStore((s) => s.currentUser);

  const isAdmin = currentUser?.roles.some((r) => r.name === 'Admin') ?? false;

  if (NO_MENU_PATHS.includes(pathname) || !isAdmin) return null;

  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t.nav.main,
    },
    {
      key: 'user-management',
      icon: <TeamOutlined />,
      label: t.nav.user_management,
      children: [
        { key: '/admin/users', label: t.nav.users },
        { key: '/admin/roles', label: t.nav.roles },
        { key: '/admin/permissions', label: t.nav.permissions },
        { key: '/admin/dictionary', label: t.nav.dictionary },
      ],
    },
  ];

  const openKeys = pathname.startsWith('/admin/') ? ['user-management'] : [];

  return (
    <aside className="w-52 min-h-[calc(100vh-56px)] border-r border-gray-200 bg-white shrink-0 pt-3">
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={openKeys}
        items={items}
        onClick={({ key }) => router.push(key)}
        className="h-full border-r-0"
        style={{ paddingInline: 6 }}
      />
    </aside>
  );
}
