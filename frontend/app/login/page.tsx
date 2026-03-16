'use client';

import { useEffect, useState } from 'react';
import { apiGetRoles } from '@/api/roles';
import LoginForm, { RoleWithPermissions } from './login-form';

export default function LoginPage() {
  const [rolesWithPermissions, setRolesWithPermissions] = useState<RoleWithPermissions[]>([]);

  useEffect(() => {
    apiGetRoles().then((roles) => {
      setRolesWithPermissions(roles.map((r) => ({ role: r.name, permissions: [] })));
    }).catch(() => {});
  }, []);

  return <LoginForm rolesWithPermissions={rolesWithPermissions} />;
}
