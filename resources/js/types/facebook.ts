export interface FacebookPage {
  id: number;
  user_id: number;
  page_id: string;
  name: string;
  access_token: string;
  active?: boolean;
}

export interface AutoReplyRule {
  id: number;
  user_id: number;
  facebook_page_id: number;
  type: 'comment' | 'inbox' | 'live';
  trigger_keyword: string;
  reply_message: string;
  enabled: boolean;
  page?: FacebookPage;
}

export interface BroadcastMessage {
  id: number;
  user_id: number;
  facebook_page_id: number;
  title: string;
  message: string;
  page?: FacebookPage;
}

export interface LiveComment {
  id: string;
  message: string;
  from: {
    id: string;
    name: string;
  };
}
