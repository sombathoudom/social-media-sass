'use client';

import { FC } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { AutoReplyRule, FacebookPage } from '@/types/facebook';
import fb from '@/routes/fb';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  pages: FacebookPage[];
  mode: 'create' | 'edit';
  rule?: AutoReplyRule;
}

const AutoReplyRuleForm: FC<Props> = ({ pages, mode, rule }) => {
  const { data, setData, post, put, processing, errors } = useForm({
    facebook_page_id: rule?.facebook_page_id ?? '',
    type: rule?.type ?? 'comment',
    trigger_keyword: rule?.trigger_keyword ?? '',
    reply_message: rule?.reply_message ?? '',
  });

  const handleSubmit = () => {
    if (mode === 'create') {
      post(fb.autoreply.store().url);
    } else {
      put(fb.autoreply.update(rule!.id).url);
    }
  };

  return (
    <>
      <Head title={mode === 'create' ? 'Create Rule' : 'Edit Rule'} />

      <div className="max-w-xl mx-auto mt-12 space-y-6">
        <h1 className="text-3xl font-bold">
          {mode === 'create' ? 'Create Auto Reply Rule' : 'Edit Auto Reply Rule'}
        </h1>

        <Select
          defaultValue={String(data.facebook_page_id)}
          onValueChange={(v) => setData('facebook_page_id', Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (
              <SelectItem key={page.id} value={String(page.id)}>
                {page.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={data.type}
          onValueChange={(v) => setData('type', v as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="inbox">Inbox</SelectItem>
            <SelectItem value="live">Live</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Keyword"
          value={data.trigger_keyword}
          onChange={(e) => setData('trigger_keyword', e.target.value)}
        />
        {errors.trigger_keyword && <p className="text-red-500">{errors.trigger_keyword}</p>}

        <Textarea
          placeholder="Reply message"
          value={data.reply_message}
          onChange={(e) => setData('reply_message', e.target.value)}
        />
        {errors.reply_message && <p className="text-red-500">{errors.reply_message}</p>}

        <Button disabled={processing} onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </>
  );
};

export default AutoReplyRuleForm;
