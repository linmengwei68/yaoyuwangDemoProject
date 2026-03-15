'use client';

import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { checkPermissionCode } from '@/lib/utils';

export default function ProjectOwnerView() {
  const t = useT();
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const canEdit = checkPermissionCode('template-edit');
  const canCreatePost = checkPermissionCode('post-edit');

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: '100%' }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {canEdit && (
          <Button
            type="primary"
            onClick={() => router.push('/template/edit')}
          >
            {t.home.edit_template}
          </Button>
        )}
        {canCreatePost && (
          <Button
            type="primary"
            onClick={() => router.push('/post/new')}
          >
            {t.home.create_post}
          </Button>
        )}
      </div>
    </div>
  );
}
