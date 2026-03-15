export interface DictionaryItem {
  id: number;
  key: string;
  value: string[];
}

export async function serverGetAllDictionaries(): Promise<DictionaryItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${baseUrl}/api/dictionary`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
