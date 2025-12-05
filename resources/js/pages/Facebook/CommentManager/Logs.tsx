import { Head, router } from '@inertiajs/react';
import { AutoReplyCampaign } from '@/types/facebook';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import fb from '@/routes/fb';

interface CommentLog {
  id: number;
  comment_id: string;
  user_id: string;
  comment_text: string;
  action: string;
  reply_message?: string;
  was_offensive: boolean;
  created_at: string;
  facebook_page?: {
    name: string;
  };
}

interface Props {
  campaign: AutoReplyCampaign;
  logs: {
    data: CommentLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function Logs({ campaign, logs }: Props) {
  return (
    <AppLayout>
      <Head title={`Logs - ${campaign.name}`} />

      <div className="container mx-auto px-6 py-6 max-w-[1600px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-gray-500 mt-1">Automation Logs</p>
          </div>
          <Button variant="outline" onClick={() => router.visit(fb.commentManager.index().url)}>
            Back to Campaigns
          </Button>
        </div>

        {logs.data.length > 0 ? (
          <div className="space-y-4">
            {logs.data.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="font-mono text-sm text-gray-500">
                          {log.comment_id}
                        </span>
                        {log.was_offensive && (
                          <Badge variant="destructive">Offensive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {log.facebook_page?.name} • {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge>{log.action}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Comment:</p>
                    <p className="text-sm mt-1">{log.comment_text}</p>
                  </div>

                  {log.reply_message && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Reply Sent:</p>
                      <p className="text-sm mt-1 text-blue-600">{log.reply_message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {logs.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: logs.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === logs.current_page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      router.visit(fb.commentManager.logs(campaign.id, { page }).url)
                    }
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Logs Yet</h3>
              <p className="text-gray-500">
                This campaign hasn't processed any comments yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
