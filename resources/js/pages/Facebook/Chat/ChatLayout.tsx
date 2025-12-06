'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import ConversationList from '@/components/Facebook/Chat/ConversationList';
import MessageList from '@/components/Facebook/Chat/MessageList';
import ChatInput from '@/components/Facebook/Chat/ChatInput';

import { FacebookConversation, FacebookMessage, Page } from '@/types/chat';
import fb from '@/routes/fb';

interface ChatLayoutProps {
    pages: Page[];
    activePageId: string | null;
    onSwitchPage: (pageId: string) => void;
}

export default function ChatLayout({
    pages,
    activePageId,
    onSwitchPage,
}: ChatLayoutProps) {
    const [conversations, setConversations] = useState<FacebookConversation[]>([]);
    const [selectedConversation, setSelectedConversation] =
        useState<FacebookConversation | null>(null);

    const [messages, setMessages] = useState<FacebookMessage[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // -----------------------------------------------------------------------
    // LOAD CONVERSATIONS FOR SELECTED PAGE
    // -----------------------------------------------------------------------
    const loadConversations = useCallback(async () => {
        if (!activePageId) return;

        setLoadingConversations(true);

        const url = fb.chat.conversations({
            query: { page_id: activePageId },
        }).url;

        const res = await axios.get(url);
        setConversations(res.data.data);

        setLoadingConversations(false);
    }, [activePageId]);

    // -----------------------------------------------------------------------
    // LOAD MESSAGES IN CONVERSATION
    // -----------------------------------------------------------------------
    const loadMessages = useCallback(async (conversationId: number) => {
        setLoadingMessages(true);

        const url = fb.chat.messages(conversationId).url;

        const res = await axios.get(url);

        setMessages(res.data.data);
        setHasMoreMessages(res.data.links?.next !== null);

        setLoadingMessages(false);
    }, []);

    // -----------------------------------------------------------------------
    // LOAD MORE MESSAGES (INFINITE SCROLL)
    // -----------------------------------------------------------------------
    const loadMoreMessages = useCallback(
        async (conversationId: number) => {
            if (!hasMoreMessages) return;

            const last = messages[0];
            if (!last) return;

            const url = fb.chat.messages(conversationId, {
                query: { before_id: last.id },
            }).url;

            const res = await axios.get(url);

            if (res.data.data.length === 0) {
                setHasMoreMessages(false);
                return;
            }

            setMessages((prev) => [...res.data.data, ...prev]);
        },
        [messages, hasMoreMessages]
    );

    // -----------------------------------------------------------------------
    // RELOAD WHEN PAGE SWITCHES
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!activePageId) return;

        loadConversations();
        setSelectedConversation(null);
        setMessages([]);
    }, [activePageId, loadConversations]);

    // -----------------------------------------------------------------------
    // REAL-TIME LISTENER
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!selectedConversation) return;

        const id = selectedConversation.id;
        const channel = window.Echo.channel(`chat.${id}`);

        channel.listen('.new.message', (event: FacebookMessage) => {
            // Add message to state (this handles both incoming and outgoing messages)
            setMessages((prev) => {
                // Check if message already exists (avoid duplicates)
                const exists = prev.some(msg => msg.id === event.id);
                if (exists) return prev;
                return [...prev, event];
            });
        });

        return () => {
            window.Echo.leave(`chat.${id}`);
        };
    }, [selectedConversation]);

    // -----------------------------------------------------------------------
    // UI RENDER
    // -----------------------------------------------------------------------
    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-neutral-900">
            {/* Sidebar */}
            <ConversationList
                pages={pages}
                activePageId={activePageId ?? ''}
                conversations={conversations}
                loading={loadingConversations}
                selectedConversation={selectedConversation}
                onSwitchPage={(pageId) => onSwitchPage(pageId)}
                onSelectConversation={(conv) => {
                    setSelectedConversation(conv);
                    loadMessages(conv.id);
                }}
            />

            {/* Chat Window */}
            <div className="flex flex-col flex-1 border-l dark:border-neutral-800">
                {selectedConversation ? (
                    <>
                        <MessageList
                            messages={messages}
                            loading={loadingMessages}
                            conversationId={selectedConversation.id}
                            onLoadMore={() =>
                                loadMoreMessages(selectedConversation.id)
                            }
                        />

                        <ChatInput
                            conversation={selectedConversation}
                            onSend={(msg) => {
                                // Add message immediately for instant feedback
                                setMessages((prev) => [...prev, msg]);
                            }}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-500">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
