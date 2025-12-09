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
    // LISTEN FOR NEW MESSAGES TO UPDATE CONVERSATION LIST (OPTIMIZED)
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!activePageId || conversations.length === 0) return;

        const channels: any[] = [];

        // Only listen to first 20 conversations to avoid too many channels
        const limitedConversations = conversations.slice(0, 20);

        limitedConversations.forEach((conv) => {
            const channel = window.Echo.channel(`chat.${conv.id}`);
            channels.push({ id: conv.id, channel });

            channel.listen('.new.message', (event: FacebookMessage) => {
                console.log('Message received for conversation:', conv.id, event);

                // Update conversation list with new message
                setConversations((prev) => {
                    const updated = prev.map((c) => {
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
                    });

                    // Sort by last message time
                    return updated.sort(
                        (a, b) =>
                            new Date(b.last_message_at || 0).getTime() -
                            new Date(a.last_message_at || 0).getTime()
                    );
                });

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
            channels.forEach(({ id }) => {
                window.Echo.leave(`chat.${id}`);
            });
        };
    }, [conversations.map(c => c.id).join(','), activePageId, selectedConversation?.id]);

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
            <div className="flex flex-col flex-1 border-l dark:border-neutral-800 bg-gradient-to-b from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-950">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="border-b dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 py-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {(selectedConversation.user?.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-lg dark:text-white">
                                        {selectedConversation.user?.name || selectedConversation.user?.psid || 'Customer'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedConversation.user?.psid ? `PSID: ${selectedConversation.user.psid.slice(0, 15)}...` : 'Facebook User'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Active</span>
                                </div>
                            </div>
                        </div>

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
                    <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Conversation Selected</h3>
                        <p className="text-gray-500 dark:text-gray-400">Choose a conversation from the list to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
