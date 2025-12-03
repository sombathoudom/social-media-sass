import { FacebookPage } from '@/types/facebook';
import AutoReplyRuleForm from '@/components/Facebook/AutoReplyRuleForm';

interface Props {
  pages: FacebookPage[];
}

export default function Create({ pages }: Props) {
  return <AutoReplyRuleForm mode="create" pages={pages} />;
}
