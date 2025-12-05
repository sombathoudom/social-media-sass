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

  // Facebook Graph API URL for page profile picture
  const pageAvatarUrl = `https://graph.facebook.com/${page.page_id}/picture?type=large`;

  return (
    <Card className={active ? 'border-blue-500 border-2' : ''}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={pageAvatarUrl} alt={page.name} />
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

        {!active ? (
          <Button onClick={handleSwitch} className="w-full">
            Set Active
          </Button>
        ) : (
          <Button disabled variant="outline" className="w-full">
            Current Active Page
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PageCard;
