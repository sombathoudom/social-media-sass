import { Head, useForm } from '@inertiajs/react';
import { CommentTemplate, FacebookPage } from '@/types/facebook';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Props {
  templates: CommentTemplate[];
  pages: FacebookPage[];
}

export default function Index({ templates, pages }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    facebook_page_id: '',
    name: '',
    message: '',
    image_url: '',
    video_url: '',
    voice_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const toastId = toast.loading('Creating template...');
    
    post('/facebook/comment-templates', {
      onSuccess: () => {
        toast.success('Template created successfully!', { id: toastId });
        reset();
        setIsOpen(false);
      },
      onError: (errors) => {
        toast.error('Failed to create template. Please check the form.', { id: toastId });
        console.error('Validation errors:', errors);
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Comment Templates" />

      <div className="container mx-auto px-6 py-6 max-w-[1600px] space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Comment Templates</h1>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Create Template</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Comment Template</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Welcome Message"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label>Facebook Page</Label>
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
                  {errors.facebook_page_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.facebook_page_id}</p>
                  )}
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    placeholder="Your template message..."
                    rows={4}
                  />
                  {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message}</p>}
                </div>

                <div>
                  <Label>Image URL (optional)</Label>
                  <Input
                    value={data.image_url}
                    onChange={(e) => setData('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Video URL (optional)</Label>
                  <Input
                    value={data.video_url}
                    onChange={(e) => setData('video_url', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div>
                  <Label>Voice URL (optional)</Label>
                  <Input
                    value={data.voice_url}
                    onChange={(e) => setData('voice_url', e.target.value)}
                    placeholder="https://example.com/voice.mp3"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={processing}>
                    Create Template
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.facebook_page?.name}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-3">{template.message}</p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {template.image_url && <span>📷 Image</span>}
                    {template.video_url && <span>🎥 Video</span>}
                    {template.voice_url && <span>🎤 Voice</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
              <p className="text-gray-500 mb-4">Create your first comment template</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
