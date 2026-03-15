'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Spin, Pagination, Card, Tag, Empty, Button, App } from 'antd';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useT } from '@/lib/i18n';
import { apiGetMyApplicantInfo } from '@/api/applicant-info';
import type { ApplicantInformation } from '@/api/applicant-info';
import { apiGetJobPostList, apiGetJobPostById, apiAddReviewer } from '@/api/job-post';
import { apiGetMyApplications } from '@/api/application';
import type { JobPost } from '@/api/job-post';
import { apiGetDictionaryByKey } from '@/api/dictionary';
import { useAppStore } from '@/lib/store';
import ApplyModal from './apply-modal';

export default function ApplicantView() {
  const t = useT();
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const [checking, setChecking] = useState(true);

  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<JobPost | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applicantInfo, setApplicantInfo] = useState<ApplicantInformation | null>(null);
  const [appliedPostIds, setAppliedPostIds] = useState<Set<number>>(new Set());
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);

  const fetchPosts = useCallback(async (p: number, title: string) => {
    setLoading(true);
    try {
      const res = await apiGetJobPostList({ page: p, pageSize, title: title || undefined });
      setPosts(res.list);
      setTotal(res.total);
      if (res.list.length > 0 && selectedId == null) {
        setSelectedId(res.list[0].id);
      } else if (res.list.length === 0) {
        setSelectedId(null);
      }
    } finally {
      setLoading(false);
    }
  }, [pageSize, selectedId]);

  useEffect(() => {
    apiGetMyApplicantInfo().then((info) => {
      if (!info) {
        router.replace('/applicant/basicInformation');
      } else {
        setApplicantInfo(info);
        setChecking(false);
      }
    });
    apiGetMyApplications().then((list) => {
      setAppliedPostIds(new Set(list.map((a) => a.jobPostId)));
    });
    apiGetDictionaryByKey('country').then((dict) => {
      if (dict) setCountryOptions(dict.value.map((v) => ({ label: v, value: v })));
    }).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (!checking) {
      fetchPosts(page, search);
    }
  }, [checking, page, search]);

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    apiGetJobPostById(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId, appliedPostIds]);

  if (checking) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}><Spin /></div>;
  }

  const handlePageChange = (p: number) => {
    setPage(p);
    setSelectedId(null);
  };

  const handleApplySuccess = (postId: number) => {
    setAppliedPostIds((prev) => new Set(prev).add(postId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Feature area - placeholder */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }} />

      {/* Main content: left cards + right detail */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Left: post cards */}
        <div style={{ width: 380, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
          {/* Search */}
          <div style={{ padding: '12px 16px' }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder={t.applicant.search_posts}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); setSelectedId(null); }}
              allowClear
            />
          </div>

          {/* Cards list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><Spin /></div>
            ) : posts.length === 0 ? (
              <Empty description={t.applicant.no_posts} style={{ marginTop: 40 }} />
            ) : (
              posts.map((post) => (
                <Card
                  key={post.id}
                  size="small"
                  style={{
                    marginBottom: 8,
                    cursor: 'pointer',
                    borderColor: selectedId === post.id ? '#1677ff' : undefined,
                    background: selectedId === post.id ? '#e6f4ff' : undefined,
                  }}
                  onClick={() => { setSelectedId(post.id); apiAddReviewer(post.id); }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{post.title}</div>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.jobDescription}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Tag color={post.state === 'active' ? 'green' : 'default'}>{post.state}</Tag>
                      {appliedPostIds.has(post.id)
                        ? <Tag color="blue">{t.applicant.applied}</Tag>
                        : currentUser && post.reviewer.includes(currentUser.email)
                          ? <Tag color="orange">{t.applicant.reviewed}</Tag>
                          : null}
                    </div>
                    <span style={{ fontSize: 12, color: '#999', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ClockCircleOutlined />
                      {new Date(post.postedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
              <Pagination size="small" current={page} total={total} pageSize={pageSize} onChange={handlePageChange} showSizeChanger={false} />
            </div>
          )}
        </div>

        {/* Right: post detail */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {detailLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spin /></div>
          ) : detail ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{detail.title}</h2>
                {appliedPostIds.has(detail.id) ? (
                  <Button disabled>{t.applicant.applied}</Button>
                ) : (
                  <Button type="primary" onClick={() => setApplyOpen(true)}>{t.applicant.apply}</Button>
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{detail.jobDescription}</div>
            </div>
          ) : (
            <Empty description={t.applicant.select_post} style={{ marginTop: 80 }} />
          )}
        </div>
      </div>

      <ApplyModal
        open={applyOpen}
        detail={detail}
        applicantInfo={applicantInfo}
        countryOptions={countryOptions}
        onClose={() => setApplyOpen(false)}
        onApplySuccess={handleApplySuccess}
      />
    </div>
  );
}
