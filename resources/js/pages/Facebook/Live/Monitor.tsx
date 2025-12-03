'use client';

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { LiveComment, FacebookPage } from '@/types/facebook';
import fb from '@/routes/fb';
import LiveCommentFeed from '@/components/Facebook/LiveCommentFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface Props {
  pages: FacebookPage[];
}

export default function Monitor({ pages }: Props) {
  const [pageId, setPageId] = useState('');
  const [liveId, setLiveId] = useState('');
  const [comments, setComments] = useState<LiveComment[]>([]);

  const fetchComments = async () => {
    if (!pageId || !liveId) return;

    const res = await axios.post(fb.live.fetch().url, {
      page_id: pageId,
      live_id: liveId,
    });

    setComments(res.data);
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
