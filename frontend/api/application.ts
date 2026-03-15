import { request } from '@/lib/request';

export interface Application {
  id: number;
  userId: number;
  jobPostId: number;
  answers: { title: string; value: string }[];
  state: 'applied' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export function apiCreateApplication(data: { jobPostId: number; answers: { title: string; value: string }[] }) {
  return request<Application>('/api/applications', { method: 'POST', body: JSON.stringify(data) });
}

export function apiCheckApplication(jobPostId: number) {
  return request<{ applied: boolean; application: Application | null }>(`/api/applications/check?jobPostId=${jobPostId}`);
}

export function apiGetMyApplications() {
  return request<{ jobPostId: number }[]>('/api/applications/my');
}
