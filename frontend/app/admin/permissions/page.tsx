import { serverGetRoles } from '@/api/roles';
import PermissionsClient from './permissions-client';

export default async function PermissionsPage() {
  const roles = await serverGetRoles();
  const roleOptions = roles.map((r) => ({ label: r.name, value: r.name }));
  return <PermissionsClient roleOptions={roleOptions} />;
}
