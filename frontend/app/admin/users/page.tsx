'use client';

import { useEffect, useState } from 'react';
import { apiGetDictionaryByKey } from '@/api/dictionary';
import UsersClient from './users-client';

export default function UsersPage() {
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    apiGetDictionaryByKey('roleoptions').then((dict) => {
      if (dict?.value) {
        setRoleOptions(dict.value.map((r) => ({ label: r, value: r })));
      }
    }).catch(() => {});
  }, []);

  return <UsersClient roleOptions={roleOptions} />;
}
