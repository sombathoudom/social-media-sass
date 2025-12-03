import { Head, Link } from '@inertiajs/react';
import { BroadcastMessage } from '@/types/facebook';
import fb from '@/routes/fb';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface Props {
  broadcasts: BroadcastMessage[];
}

export default function Index({ broadcasts }: Props) {
  return (
    <>
      <Head title="Broadcast Messages" />

      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Broadcast Messages</h1>

          <Link href={fb.broadcast.create()}>
            <Button>Create Broadcast</Button>
          </Link>
        </div>

        {broadcasts?.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <h3 className="font-medium">{b.title}</h3>
            </CardHeader>

            <CardContent>
              <p>{b.message}</p>
              <p className="text-sm text-gray-500 mt-2">Page: {b.page?.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
