import { serverGetPermissions } from '@/api/permissions';
import RolesClient from './roles-client';

export default async function RolesPage() {
  const permissions = await serverGetPermissions();
  const permissionOptions = permissions.map((p) => ({ label: p.name, value: p.name }));
  return <RolesClient permissionOptions={permissionOptions} />;
}
