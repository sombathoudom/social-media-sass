import { AutoReplyRule, FacebookPage } from '@/types/facebook';
import AutoReplyRuleForm from '@/components/Facebook/AutoReplyRuleForm';

interface Props {
  pages: FacebookPage[];
  rule: AutoReplyRule;
}

export default function Edit({ pages, rule }: Props) {
  return <AutoReplyRuleForm mode="edit" pages={pages} rule={rule} />;
}
