import { FC } from 'react';
import { FacebookPage } from '@/types/facebook';
import { router } from '@inertiajs/react';
import fb from '@/routes/fb';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  page: FacebookPage;
  active: boolean;
}

const PageCard: FC<Props> = ({ page, active }) => {
  const handleSwitch = () => {
    router.post(fb.pages.switch().url, {
      page_id: page.page_id,
    });
  };

  return (
    <Card className={active ? 'border-blue-500' : ''}>
      <CardHeader>
        <h2 className="font-semibold text-xl">{page.name}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>Page ID: {page.page_id}</p>

        {!active ? (
          <Button onClick={handleSwitch}>Set Active</Button>
        ) : (
          <Button disabled variant="outline">
            Active Page
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PageCard;
