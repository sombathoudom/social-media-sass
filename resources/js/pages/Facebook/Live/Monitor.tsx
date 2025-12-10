'use client';

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { LiveComment, FacebookPage } from '@/types/facebook';
import fb from '@/routes/fb';
import LiveCommentFeed from '@/components/Facebook/LiveCommentFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';

interface Props {
  pages: FacebookPage[];
}

export default function Monitor({ pages }: Props) {
  const [pageId, setPageId] = useState('');
  const [liveId, setLiveId] = useState('');
  const [comments, setComments] = useState<LiveComment[]>([]);

  const fetchComments = () => {
    if (!pageId || !liveId) return;

    router.post(fb.live.fetch().url, {
      page_id: pageId,
      live_id: liveId,
    }, {
      preserveState: true,
      preserveScroll: true,
      only: ['comments'],
      onSuccess: (page: any) => {
        setComments(page.props.comments || []);
      },
      onError: (errors) => {
        console.error('Failed to fetch live comments:', errors);
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(fetchComments, 3000);
    return () => clearInterval(interval);
  }, [pageId, liveId]);

  return (
    <>
      <Head title="Live Monitor" />

      <div className="max-w-3xl mx-auto mt-8 space-y-6">
        <h1 className="text-3xl font-bold">Live Monitor</h1>

        <select
          className="border p-2 rounded"
          value={pageId}
          onChange={(e) => setPageId(e.target.value)}
        >
          <option>Select page</option>

          {pages.map((page) => (
            <option key={page.id} value={page.page_id}>
              {page.name}
            </option>
          ))}
        </select>

        <Input
          placeholder="Live Video ID"
          value={liveId}
          onChange={(e) => setLiveId(e.target.value)}
        />

        <Button onClick={fetchComments}>Fetch Now</Button>

        <LiveCommentFeed comments={comments} />
      </div>
    </>
  );
}
