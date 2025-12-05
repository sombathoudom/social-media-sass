import { Head, useForm, router } from '@inertiajs/react';
import { FacebookPage, CommentTemplate } from '@/types/facebook';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import fb from '@/routes/fb';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  pages: FacebookPage[];
  templates: CommentTemplate[];
}

export default function Create({ pages, templates }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    apply_to_all_pages: false,
    facebook_page_ids: [] as string[],
    delete_offensive: false,
    offensive_keywords: '',
    offensive_reply_template_id: null as string | null,
    allow_multiple_replies: false,
    enable_comment_reply: true,
    like_comment: false,
    hide_after_reply: false,
    reply_type: 'filtered' as 'ai' | 'generic' | 'filtered',
    match_type: 'any' as 'exact' | 'any',
    filter_keywords: '',
    comment_reply_message: '',
    comment_reply_image: '',
    comment_reply_video: '',
    comment_reply_voice: '',
    no_match_reply: '',
  });

  const togglePage = (pageId: string) => {
    const current = [...data.facebook_page_ids];
    const index = current.indexOf(pageId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(pageId);
    }
    setData('facebook_page_ids', current);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const toastId = toast.loading('Creating campaign...');
    
    post(fb.commentManager.store().url, {
      onError: (errors) => {
        toast.error('Failed to create campaign. Please check the form.', { id: toastId });
        console.error('Validation errors:', errors);
      },
      onSuccess: () => {
        toast.success('Campaign created successfully!', { id: toastId });
        router.visit(fb.commentManager.index().url);
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Create Comment Campaign" />

      <div className="container mx-auto px-6 py-6 max-w-[1400px]">
        <h1 className="text-3xl font-bold mb-6">Create Comment Campaign</h1>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="My Comment Campaign"
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label>Apply to Pages</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={data.apply_to_all_pages}
                      onCheckedChange={(checked) => {
                        setData('apply_to_all_pages', checked as boolean);
                        if (checked) {
                          setData('facebook_page_ids', []);
                        }
                      }}
                    />
                    <Label>Apply to all pages</Label>
                  </div>

                  {!data.apply_to_all_pages && (
                    <div className="border rounded-md p-4 space-y-2">
                      <p className="text-sm font-medium mb-2">Select specific pages:</p>
                      {pages.map((page) => (
                        <div key={page.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={data.facebook_page_ids.includes(String(page.id))}
                            onCheckedChange={() => togglePage(String(page.id))}
                          />
                          <Label className="font-normal">{page.name}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.facebook_page_ids && (
                  <p className="text-sm text-red-500 mt-1">{errors.facebook_page_ids}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Offensive Comments */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Offensive Comment Detection</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={data.delete_offensive}
                  onCheckedChange={(checked) => setData('delete_offensive', checked as boolean)}
                />
                <Label>Delete offensive comments</Label>
              </div>

              {data.delete_offensive && (
                <>
                  <div>
                    <Label>Offensive Keywords (comma separated)</Label>
                    <Input
                      value={data.offensive_keywords}
                      onChange={(e) => setData('offensive_keywords', e.target.value)}
                      placeholder="spam, hate, offensive"
                    />
                  </div>

                  <div>
                    <Label>Private Reply Template After Deletion</Label>
                    <Select onValueChange={(v) => setData('offensive_reply_template_id', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={String(template.id)}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={data.allow_multiple_replies}
                      onCheckedChange={(checked) =>
                        setData('allow_multiple_replies', checked as boolean)
                      }
                    />
                    <Label>Allow multiple replies to same user</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Comment Reply Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Comment Reply Settings</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={data.enable_comment_reply}
                  onCheckedChange={(checked) => setData('enable_comment_reply', checked as boolean)}
                />
                <Label>Enable comment reply</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={data.like_comment}
                  onCheckedChange={(checked) => setData('like_comment', checked as boolean)}
                />
                <Label>Like comments by page</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={data.hide_after_reply}
                  onCheckedChange={(checked) => setData('hide_after_reply', checked as boolean)}
                />
                <Label>Hide comments after reply</Label>
              </div>
            </CardContent>
          </Card>

          {/* Reply Type */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Reply Configuration</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Reply Type</Label>
                <Select
                  value={data.reply_type}
                  onValueChange={(v) => setData('reply_type', v as 'ai' | 'generic' | 'filtered')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">Automated by AI</SelectItem>
                    <SelectItem value="generic">Generic message for all</SelectItem>
                    <SelectItem value="filtered">Filter by word/sentence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {data.reply_type === 'filtered' && (
                <>
                  <div>
                    <Label>Match Type</Label>
                    <Select
                      value={data.match_type}
                      onValueChange={(v) => setData('match_type', v as 'exact' | 'any')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exact">Exact match</SelectItem>
                        <SelectItem value="any">Any match</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Filter Keywords (comma separated)</Label>
                    <Input
                      value={data.filter_keywords}
                      onChange={(e) => setData('filter_keywords', e.target.value)}
                      placeholder="price, info, contact"
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Comment Reply Message</Label>
                <Textarea
                  value={data.comment_reply_message}
                  onChange={(e) => setData('comment_reply_message', e.target.value)}
                  placeholder="Thank you for your comment!"
                  rows={3}
                />
              </div>

              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={data.comment_reply_image}
                  onChange={(e) => setData('comment_reply_image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>Video URL (optional, MP4 preferred)</Label>
                <Input
                  value={data.comment_reply_video}
                  onChange={(e) => setData('comment_reply_video', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div>
                <Label>Voice URL (optional)</Label>
                <Input
                  value={data.comment_reply_voice}
                  onChange={(e) => setData('comment_reply_voice', e.target.value)}
                  placeholder="https://example.com/voice.mp3"
                />
              </div>
            </CardContent>
          </Card>

          {/* No Match Reply */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">No Match Reply</h2>
            </CardHeader>
            <CardContent>
              <Label>Reply when no filter matches</Label>
              <Textarea
                value={data.no_match_reply}
                onChange={(e) => setData('no_match_reply', e.target.value)}
                placeholder="Thank you for your interest!"
                rows={3}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={processing}>
              Create Campaign
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
