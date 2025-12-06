export interface Page {
  id: number;
  name: string;
  page_id: string;
}

export interface FacebookPageUser {
  id: number;
  psid: string;
  name: string;
  profile_pic?: string;
}

export interface FacebookConversation {
  id: number;
  facebook_page_id: number;
  facebook_page_user_id: number;
  unread_count: number;
  last_message?: string | null;
  last_message_at?: string | null;
  user: FacebookPageUser;
}

export interface FacebookMessage {
  id: number;
  conversation_id: number;
  from_type: 'page' | 'user';
  message_type: 'text' | 'image' | 'audio' | 'voice' | 'video' | 'file' | 'emoji' | 'template';
  message: string | null;
  attachments?: any;
  sent_at: string;
}

export interface SavedReply {
  id: number;
  title: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  meta?: any;
}
