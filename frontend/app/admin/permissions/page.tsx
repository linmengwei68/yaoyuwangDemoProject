'use client';

import { useEffect, useState } from 'react';
import { apiGetRoles } from '@/api/roles';
import PermissionsClient from './permissions-client';

export default function PermissionsPage() {
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    apiGetRoles().then((roles) => {
      setRoleOptions(roles.map((r) => ({ label: r.name, value: r.name })));
    }).catch(() => {});
  }, []);

  return <PermissionsClient roleOptions={roleOptions} />;
}
