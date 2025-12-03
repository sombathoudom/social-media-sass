import { Head, Link } from '@inertiajs/react';
import  fb  from '@/routes/fb';
import { Button } from '@/components/ui/button';

export default function Connect() {
  return (
    <>
      <Head title="Connect Facebook" />

      <div className="max-w-lg mx-auto mt-20 text-center space-y-4">
        <h1 className="text-3xl font-bold">Connect Your Facebook</h1>

        <Link href={fb.connect()}>
          <Button className="mt-6">Connect Facebook</Button>
        </Link>
      </div>
    </>
  );
}
