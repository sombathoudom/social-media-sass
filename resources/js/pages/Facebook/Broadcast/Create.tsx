import BroadcastForm from '@/components/Facebook/BroadcastForm';
import { FacebookPage } from '@/types/facebook';

interface Props {
  pages: FacebookPage[];
}

export default function Create({ pages }: Props) {
  return <BroadcastForm pages={pages} />;
}
