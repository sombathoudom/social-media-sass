import { Head, useForm, router } from '@inertiajs/react';
import { FacebookPage, CommentTemplate, AutoReplyCampaign } from '@/types/facebook';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
  campaign: AutoReplyCampaign;
  pages: FacebookPage[];
  templates: CommentTemplate[];
}

export default function Edit({ campaign, pages, templates }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: campaign.name,
    apply_to_all_pages: campaign.apply_to_all_pages,
    facebook_page_ids: campaign.facebook_pages?.map((p) => String(p.id)) || [],
    delete_offensive: campaign.delete_offensive,
    offensive_keywords: campaign.offensive_keywords || '',
    offensive_reply_template_id: campaign.offensive_reply_template_id
      ? String(campaign.offensive_reply_template_id)
      : null,
    allow_multiple_replies: campaign.allow_multiple_replies,
    enable_comment_reply: campaign.enable_comment_reply,
    like_comment: campaign.like_comment,
    hide_after_reply: campaign.hide_after_reply,
    reply_type: campaign.reply_type,
    match_type: campaign.match_type,
    filter_keywords: campaign.filter_keywords || '',
    comment_reply_message: campaign.comment_reply_message || '',
    comment_reply_image: campaign.comment_reply_image || '',
    comment_reply_video: campaign.comment_reply_video || '',
    comment_reply_voice: campaign.comment_reply_voice || '',
    no_match_reply: campaign.no_match_reply || '',
    is_active: campaign.is_active,
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
    put(fb.commentManager.update(campaign.id).url);
  };

  return (
    <AppLayout>
      <Head title={`Edit ${campaign.name}`} />

      <div className="container mx-auto px-6 py-6 max-w-[1400px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Edit Campaign</h1>
          <Button variant="outline" onClick={() => router.visit(fb.commentManager.index().url)}>
            Back to List
          </Button>
        </div>

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
          {/* Same form fields as Create.tsx but with data pre-filled */}
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
                />
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
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                />
                <Label>Campaign is active</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={processing}>
              Update Campaign
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.visit(fb.commentManager.index().url)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
