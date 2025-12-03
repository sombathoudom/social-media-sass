'use client';

import { router, usePage } from '@inertiajs/react';
import ChatLayout from './ChatLayout';
import fb from '@/routes/fb';

import { Page, FacebookConversation, FacebookMessage } from '@/types/chat';

interface PageProps {
    pages: Page[];
    activeConversation: FacebookConversation | null;
    messages: {
        data: FacebookMessage[];
        next_page_url: string | null;
        current_page: number;
        last_page: number;
    } | null;
    filters: {
        page_id?: string;
        conversation_id?: number;
        search?: string;
        unread?: boolean;
    };
}

export default function ChatPage() {
    const { pages, filters } = usePage<PageProps>().props;

    const activePageId =
        filters.page_id ??
        pages[0]?.page_id ??   // IMPORTANT: your column is page_id
        null;

    const handleSwitchPage = (pageId: string) => {
        router.get(
            fb.chat.index({
                query: {
                    page_id: pageId,
                },
            })
        );
    };

    return (
        <ChatLayout
            pages={pages}
            activePageId={activePageId}
            onSwitchPage={handleSwitchPage}
        />
    );
}
