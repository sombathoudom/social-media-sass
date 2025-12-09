'use client';

import { FC } from 'react';
import { Page, FacebookConversation } from '@/types/chat';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
    pages: Page[];
    activePageId: string;
    conversations: FacebookConversation[];
    loading: boolean;
    selectedConversation: FacebookConversation | null;

    onSwitchPage: (pageId: string) => void;
    onSelectConversation: (conversation: FacebookConversation) => void;
}

const ConversationList: FC<Props> = ({
    pages,
    activePageId,
    conversations,
    loading,
    selectedConversation,
    onSwitchPage,
    onSelectConversation,
}) => {
    return (
        <div className="w-80 border-r dark:border-neutral-800 h-full flex flex-col bg-white dark:bg-neutral-900">

            {/* Page Switcher - Modern Design */}
            <div className="p-4 border-b dark:border-neutral-700 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-white font-semibold text-lg">Messages</h2>
                        <p className="text-blue-100 text-xs">{conversations.length} conversations</p>
                    </div>
                </div>
                <select
                    value={activePageId}
                    onChange={(e) => onSwitchPage(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-white/30 transition hover:bg-white/20"
                >
                    {pages.map((page) => (
                        <option key={page.id} value={page.page_id} className="text-gray-900">
                            {page.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isActive =
                            selectedConversation?.id === conv.id;

                        return (
                            <div
                                key={conv.id}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-neutral-800 dark:hover:to-neutral-800 transition-all duration-200 border-b border-neutral-100 dark:border-neutral-800',
                                    isActive &&
                                        'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-neutral-700 dark:to-neutral-700 border-l-4 border-l-blue-600 shadow-sm'
                                )}
                                onClick={() => onSelectConversation(conv)}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-neutral-800">
                                        <AvatarImage
                                            src={conv.user.profile_pic}
                                            alt={conv.user.name}
                                            loading="lazy"
                                        />
                                    </Avatar>
                                    {conv.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-neutral-900">
                                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-semibold dark:text-white text-sm truncate">
                                            {conv.user?.name || conv.user?.psid || 'Facebook User'}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                                            {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {conv.last_message || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
