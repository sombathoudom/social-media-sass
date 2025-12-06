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
    // RELOAD CONVERSATIONS WHEN TAB BECOMES VISIBLE
    // -----------------------------------------------------------------------
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && activePageId) {
                console.log('Tab visible again, reloading conversations');
                loadConversations();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [activePageId, loadConversations]);

    // -----------------------------------------------------------------------
    // LISTEN FOR NEW CONVERSATIONS (page-level channel)
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!activePageId) return;

        const pageChannel = window.Echo.channel(`page.${activePageId}`);

        pageChannel.listen('.new.conversation', (event: any) => {
            console.log('New conversation detected:', event);
            // Reload conversations to include the new one
            loadConversations();
        });

        return () => {
            window.Echo.leave(`page.${activePageId}`);
        };
    }, [activePageId, loadConversations]);

    // -----------------------------------------------------------------------
    // LISTEN FOR NEW MESSAGES TO UPDATE CONVERSATION LIST
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!activePageId || conversations.length === 0) return;

        const channels: any[] = [];

        // Listen to all conversations for this page
        conversations.forEach((conv) => {
            const channel = window.Echo.channel(`chat.${conv.id}`);
            channels.push({ id: conv.id, channel });

            channel.listen('.new.message', (event: FacebookMessage) => {
                console.log('Message received for conversation:', conv.id, event);

                // Update conversation list with new message
                setConversations((prev) =>
                    prev.map((c) => {
                        if (c.id === conv.id) {
                            return {
                                ...c,
                                last_message: event.message,
                                last_message_at: event.sent_at,
                                unread_count:
                                    selectedConversation?.id === c.id
                                        ? c.unread_count
                                        : c.unread_count + 1,
                            };
                        }
                        return c;
                    })
                );

                // Sort conversations by last message time
                setConversations((prev) =>
                    [...prev].sort(
                        (a, b) =>
                            new Date(b.last_message_at || 0).getTime() -
                            new Date(a.last_message_at || 0).getTime()
                    )
                );

                // If this is the selected conversation, add message to message list
                if (selectedConversation?.id === conv.id) {
                    setMessages((prev) => {
                        const exists = prev.some(msg => msg.id === event.id);
                        if (exists) return prev;
                        return [...prev, event];
                    });
                }
            });
        });

        return () => {
            channels.forEach(({ id, channel }) => {
                window.Echo.leave(`chat.${id}`);
            });
        };
    }, [conversations, activePageId, selectedConversation]);

    // Note: Real-time listener is now handled in the conversation list listener above
    // This avoids duplicate listeners and ensures messages appear correctly

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
                    // Clear messages first to avoid mixing
                    setMessages([]);
                    setSelectedConversation(conv);
                    loadMessages(conv.id);
                    
                    // Reset unread count in the conversation list
                    setConversations((prev) =>
                        prev.map((c) =>
                            c.id === conv.id
                                ? { ...c, unread_count: 0 }
                                : c
                        )
                    );
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
                            customerName={
                                selectedConversation.user?.name ||
                                selectedConversation.user?.psid ||
                                'Customer'
                            }
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
