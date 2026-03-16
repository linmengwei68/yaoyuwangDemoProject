'use client';

import { useEffect, useState } from 'react';
import { apiGetPermissions } from '@/api/permissions';
import RolesClient from './roles-client';

export default function RolesPage() {
  const [permissionOptions, setPermissionOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    apiGetPermissions().then((perms) => {
      setPermissionOptions(perms.map((p) => ({ label: p.name, value: p.name })));
    }).catch(() => {});
  }, []);

  return <RolesClient permissionOptions={permissionOptions} />;
}
