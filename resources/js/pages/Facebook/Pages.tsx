import { Head } from '@inertiajs/react';
import { FacebookPage } from '@/types/facebook';
import PageCard from '@/components/Facebook/PageCard';

interface Props {
  pages: FacebookPage[];
  active_page_id: string | null;
}

export default function Pages({ pages, active_page_id }: Props) {
  return (
    <>
      <Head title="Pages" />

      <div className="max-w-3xl mx-auto mt-10 space-y-4">
        <h1 className="text-3xl font-bold">Your Facebook Pages</h1>

        <div className="grid gap-4 md:grid-cols-2">
          {pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              active={page.page_id === active_page_id}
            />
          ))}
        </div>
      </div>
    </>
  );
}
