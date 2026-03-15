import { serverGetAllDictionaries } from '@/api/dictionary';
import UsersClient from './users-client';

export default async function UsersPage() {
  const dictionaries = await serverGetAllDictionaries();
  const roleOptions = (dictionaries.find((d) => d.key === 'roleoptions')?.value ?? []).map(
    (r) => ({ label: r, value: r }),
  );

  return <UsersClient roleOptions={roleOptions} />;
}
