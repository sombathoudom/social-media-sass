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

            {/* Page Switcher */}
            <div className="p-4 border-b dark:border-neutral-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-900">
                <select
                    value={activePageId}
                    onChange={(e) => onSwitchPage(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2.5 dark:bg-neutral-800 dark:text-white dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                    {pages.map((page) => (
                        <option key={page.id} value={page.page_id}>
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
                                    'flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-neutral-800 transition-all duration-150 border-b border-neutral-100 dark:border-neutral-800',
                                    isActive &&
                                        'bg-blue-100 dark:bg-neutral-700 border-l-4 border-l-blue-600'
                                )}
                                onClick={() => onSelectConversation(conv)}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage
                                            src={conv.user.profile_pic}
                                            alt={conv.user.name}
                                            loading="lazy"
                                        />
                                    </Avatar>
                                    {conv.unread_count > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold dark:text-white text-sm truncate">
                                        {conv.user?.name || conv.user?.psid || 'Facebook User'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {conv.last_message || 'No messages yet'}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
