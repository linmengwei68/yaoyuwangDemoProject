'use client';

import { useAppStore } from '@/lib/store';
import ApplicantView from '@/components/home/applicant-view';
import ProjectOwnerView from '@/components/home/project-owner-view';

export default function Home() {
  const currentUser = useAppStore((s) => s.currentUser);

  const isApplicantOnly =
    currentUser?.roles?.length === 1 && currentUser.roles[0].name === 'Applicant';

  if (!currentUser) return null;

  return isApplicantOnly ? <ApplicantView /> : <ProjectOwnerView />;
}
