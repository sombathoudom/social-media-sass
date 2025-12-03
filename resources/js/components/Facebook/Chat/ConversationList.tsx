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
            <div className="p-4 border-b dark:border-neutral-700">
                <select
                    value={activePageId}
                    onChange={(e) => onSwitchPage(e.target.value)}
                    className="w-full border rounded px-3 py-2 dark:bg-neutral-800 dark:text-white dark:border-neutral-700"
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
                                    'flex items-center gap-3 px-4 py-3 border-b dark:border-neutral-800 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition',
                                    isActive &&
                                        'bg-neutral-200 dark:bg-neutral-700'
                                )}
                                onClick={() => onSelectConversation(conv)}
                            >
                                {/* Avatar */}
                                <Avatar>
                                    <AvatarImage
                                        src={conv.user.profile_pic}
                                        alt={conv.user.name}
                                    />
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1">
                                    <p className="font-medium dark:text-white">
                                        {conv.user.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
                                        {conv.last_message ?? 'No messages yet'}
                                    </p>
                                </div>

                                {/* Unread Badge */}
                                {conv.unread_count > 0 && (
                                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;
