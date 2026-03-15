import LoginForm, { RoleWithPermissions } from './login-form';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  try {
    const rolesRes = await fetch(`${API_URL}/api/roles`, { cache: 'no-store' });
    if (!rolesRes.ok) return [];
    const roles: { id: number; name: string; description: string | null }[] = await rolesRes.json();

    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        try {
          const permRes = await fetch(`${API_URL}/api/roles/${role.name}/permissions`, { cache: 'no-store' });
          if (!permRes.ok) return { role: role.name, permissions: [] };
          const data = await permRes.json();
          return {
            role: role.name,
            permissions: (data.permissions as { name: string }[]).map((p) => p.name),
          };
        } catch {
          return { role: role.name, permissions: [] };
        }
      }),
    );

    return rolesWithPermissions;
  } catch {
    return [];
  }
}

export default async function LoginPage() {
  const rolesWithPermissions = await getRolesWithPermissions();
  return <LoginForm rolesWithPermissions={rolesWithPermissions} />;
}
