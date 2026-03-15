'use client';

import { useParams } from 'next/navigation';
import TemplateForm from '@/components/template/template-form';

export default function TemplateEditDetailPage() {
  const params = useParams();
  const templateId = Number(params.id);

  return <TemplateForm mode="edit" templateId={templateId} />;
}
