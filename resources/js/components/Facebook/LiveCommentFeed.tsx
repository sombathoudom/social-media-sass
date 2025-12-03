'use client';

import { FC } from 'react';
import { LiveComment } from '@/types/facebook';

interface Props {
  comments: LiveComment[];
}

const LiveCommentFeed: FC<Props> = ({ comments }) => {
  return (
    <div className="space-y-3 mt-4">
      {comments.map((c) => (
        <div key={c.id} className="p-3 border rounded">
          <p className="font-bold">{c.from.name}</p>
          <p>{c.message}</p>
        </div>
      ))}
    </div>
  );
};

export default LiveCommentFeed;
