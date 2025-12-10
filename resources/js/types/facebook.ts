export interface FacebookPage {
  id: number;
  user_id: number;
  page_id: string;
  name: string;
  active?: boolean;
  webhook_subscribed?: boolean;
  webhook_fields?: string[];
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

export interface CommentTemplate {
  id: number;
  user_id: number;
  facebook_page_id: number;
  name: string;
  message: string;
  image_url?: string;
  video_url?: string;
  voice_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facebook_page?: FacebookPage;
}

export interface AutoReplyCampaign {
  id: number;
  user_id: number;
  name: string;
  apply_to_all_pages: boolean;
  delete_offensive: boolean;
  offensive_keywords?: string;
  offensive_reply_template_id?: number;
  allow_multiple_replies: boolean;
  enable_comment_reply: boolean;
  like_comment: boolean;
  hide_after_reply: boolean;
  reply_type: 'ai' | 'generic' | 'filtered';
  match_type: 'exact' | 'any';
  filter_keywords?: string;
  comment_reply_message?: string;
  comment_reply_image?: string;
  comment_reply_video?: string;
  comment_reply_voice?: string;
  no_match_reply?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facebook_pages?: FacebookPage[];
  offensive_reply_template?: CommentTemplate;
}
