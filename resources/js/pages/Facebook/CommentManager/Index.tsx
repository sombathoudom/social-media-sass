import { Head, Link, router } from '@inertiajs/react';
import { AutoReplyCampaign } from '@/types/facebook';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import fb from '@/routes/fb';

interface Props {
  campaigns: AutoReplyCampaign[];
}

export default function Index({ campaigns }: Props) {
  const handleDelete = (id: number) => {
    toast('Are you sure you want to delete this campaign?', {
      action: {
        label: 'Delete',
        onClick: () => {
          const toastId = toast.loading('Deleting campaign...');
          
          router.delete(fb.commentManager.destroy(id).url, {
            onSuccess: () => {
              toast.success('Campaign deleted successfully!', { id: toastId });
            },
            onError: () => {
              toast.error('Failed to delete campaign', { id: toastId });
            },
          });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => toast.dismiss(),
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Comment Manager" />
      <div className="container mx-auto px-6 py-6 max-w-[1600px] space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Comment Manager</h1>
          <Link href={fb.commentManager.create().url}>
            <Button>Create Campaign</Button>
          </Link>
        </div>

        {campaigns.length > 0 ? (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{campaign.name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {campaign.apply_to_all_pages ? (
                          <span className="font-medium text-blue-600">All Pages</span>
                        ) : campaign.facebook_pages && campaign.facebook_pages.length > 0 ? (
                          <span>
                            {campaign.facebook_pages.length} page(s):{' '}
                            {campaign.facebook_pages.map((p) => p.name).join(', ')}
                          </span>
                        ) : (
                          <span className="text-orange-600">No pages selected</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Reply Type:</span>
                      <p className="capitalize">{campaign.reply_type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Match Type:</span>
                      <p className="capitalize">{campaign.match_type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Comment Reply:</span>
                      <p>{campaign.enable_comment_reply ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Like Comments:</span>
                      <p>{campaign.like_comment ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {campaign.delete_offensive && (
                    <div className="bg-red-50 p-3 rounded">
                      <p className="text-sm font-medium text-red-800">
                        Offensive Comment Detection Enabled
                      </p>
                      {campaign.offensive_keywords && (
                        <p className="text-xs text-red-600 mt-1">
                          Keywords: {campaign.offensive_keywords}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={fb.commentManager.logs(campaign.id).url}>
                      <Button variant="secondary" size="sm">
                        View Logs
                      </Button>
                    </Link>
                    <Link href={fb.commentManager.edit(campaign.id).url}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first comment management campaign
              </p>
              <Link href={fb.commentManager.create().url}>
                <Button>Create Campaign</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
