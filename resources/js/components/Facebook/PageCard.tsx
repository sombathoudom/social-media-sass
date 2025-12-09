import { FC } from 'react';
import { FacebookPage } from '@/types/facebook';
import { router } from '@inertiajs/react';
import fb from '@/routes/fb';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Props {
  page: FacebookPage;
  active: boolean;
}

const PageCard: FC<Props> = ({ page, active }) => {
  const handleSwitch = () => {
    const toastId = toast.loading('Switching page...');
    
    router.post(fb.pages.switch().url, {
      page_id: page.page_id,
    }, {
      onSuccess: () => {
        toast.success(`Switched to ${page.name}`, { id: toastId });
      },
      onError: () => {
        toast.error('Failed to switch page', { id: toastId });
      },
    });
  };

  const handleSubscribeWebhook = () => {
    const toastId = toast.loading('Subscribing to webhook...');
    
    router.post(`/facebook/pages/${page.id}/subscribe-webhook`, {}, {
      onSuccess: () => {
        toast.success('Page subscribed to webhook!', { id: toastId });
      },
      onError: () => {
        toast.error('Failed to subscribe to webhook', { id: toastId });
      },
    });
  };

  // Facebook Graph API URL for page profile picture
  const pageAvatarUrl = `https://graph.facebook.com/${page.page_id}/picture?type=large`;

  return (
    <Card className={active ? 'border-blue-500 border-2' : ''}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={pageAvatarUrl} alt={page.name} loading="lazy" />
            <AvatarFallback>{page.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{page.name}</h2>
            {active && <Badge variant="default" className="mt-1">Active</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-500">Page ID: {page.page_id}</p>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Webhook:</span>
          {page.webhook_subscribed ? (
            <Badge variant="default" className="text-xs">Subscribed</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Not Subscribed</Badge>
          )}
        </div>

        <div className="space-y-2">
          {!active ? (
            <Button onClick={handleSwitch} className="w-full">
              Set Active
            </Button>
          ) : (
            <Button disabled variant="outline" className="w-full">
              Current Active Page
            </Button>
          )}

          {!page.webhook_subscribed && (
            <Button 
              onClick={handleSubscribeWebhook} 
              variant="secondary" 
              size="sm"
              className="w-full"
            >
              Subscribe to Webhook
            </Button>
          )}

          <Button
            onClick={() => router.visit(`/facebook/pages/${page.id}/posts`)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            View Posts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PageCard;
