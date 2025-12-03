'use client';

import { FC } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { FacebookPage } from '@/types/facebook';
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
}

const BroadcastForm: FC<Props> = ({ pages }) => {
  const { data, setData, post, processing, errors } = useForm({
    facebook_page_id: '',
    title: '',
    message: '',
  });

  const submit = () => post(fb.broadcast.store().url);

  return (
    <>
      <Head title="Create Broadcast" />

      <div className="max-w-xl mx-auto mt-12 space-y-6">
        <h1 className="text-3xl font-bold">Create Broadcast</h1>

        <Select onValueChange={(v) => setData('facebook_page_id', v)}>
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

        <Input
          placeholder="Title"
          value={data.title}
          onChange={(e) => setData('title', e.target.value)}
        />

        <Textarea
          placeholder="Message"
          value={data.message}
          onChange={(e) => setData('message', e.target.value)}
        />

        <Button disabled={processing} onClick={submit}>
          Send Broadcast
        </Button>
      </div>
    </>
  );
};

export default BroadcastForm;
