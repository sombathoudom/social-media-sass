import { Head, Link, router } from '@inertiajs/react';
import { FacebookPage } from '@/types/facebook';
import PageCard from '@/components/Facebook/PageCard';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import fb from '@/routes/fb';

interface FacebookProfile {
  name: string | null;
  email: string | null;
  avatar: string | null;
  connected: boolean;
}

interface Props {
  pages: FacebookPage[];
  active_page_id: string | null;
  facebook_profile: FacebookProfile;
}

export default function Pages({ pages, active_page_id, facebook_profile }: Props) {
  const handleSyncPages = () => {
    router.post(fb.pages.sync().url);
  };

  const handleReconnect = () => {
    // Use window.location for OAuth redirect (not Inertia)
    window.location.href = fb.connect().url;
  };

  const handleConnect = () => {
    // Use window.location for OAuth redirect (not Inertia)
    window.location.href = fb.connect().url;
  };

  return (
    <AppLayout>
      <Head title="Pages" />

      <div className="container mx-auto px-6 py-6 max-w-[1600px] space-y-6">
        {facebook_profile.connected && (
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={facebook_profile.avatar || undefined} />
                <AvatarFallback>
                  {facebook_profile.name?.charAt(0).toUpperCase() || 'FB'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{facebook_profile.name}</h2>
                <p className="text-sm text-gray-500">{facebook_profile.email}</p>
              </div>
              <Button variant="outline" onClick={handleReconnect}>
                Reconnect
              </Button>
            </CardContent>
          </Card>
        )}

        {pages.length > 0 ? (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Your Facebook Pages</h1>
              <Button variant="outline" onClick={handleSyncPages}>
                Sync Pages
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  active={page.page_id === active_page_id}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h1 className="text-3xl font-bold">No Facebook Pages</h1>
            <p className="text-gray-500 text-center">
              Connect your Facebook account to manage your pages
            </p>
            <Button size="lg" onClick={handleConnect}>
              Connect with Facebook
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
