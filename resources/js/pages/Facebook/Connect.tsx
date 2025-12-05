import { Head } from '@inertiajs/react';
import fb from '@/routes/fb';
import { Button } from '@/components/ui/button';

export default function Connect() {
  const handleConnect = () => {
    // Use window.location for OAuth redirect (not Inertia)
    // OAuth flows require full page redirects, not AJAX calls
    window.location.href = fb.connect().url;
  };

  return (
    <>
      <Head title="Connect Facebook" />

      <div className="max-w-lg mx-auto mt-20 text-center space-y-4">
        <h1 className="text-3xl font-bold">Connect Your Facebook</h1>

        <Button className="mt-6" onClick={handleConnect}>
          Connect Facebook
        </Button>
      </div>
    </>
  );
}
