'use client';

import { FC, useEffect, useRef, useCallback, useState } from 'react';
import { FacebookMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Props {
    messages: FacebookMessage[];
    loading: boolean;
    conversationId: number;
    customerName?: string;
    onLoadMore: () => void;
}

const MessageList: FC<Props> = ({
    messages,
    loading,
    conversationId,
    customerName = 'Customer',
    onLoadMore,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(messages.length);
    const isInitialLoad = useRef(true);
    const [showScrollButton, setShowScrollButton] = useState(false);

    // -----------------------------------------------------------------------
    // REAL-TIME LISTENER FOR INCOMING MESSAGES
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!conversationId) return;

        const channel = window.Echo.channel(`chat.${conversationId}`);

        channel.listen('.new.message', (event: FacebookMessage) => {
            // Only scroll if user is near bottom (within 100px)
            if (containerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                if (isNearBottom) {
                    setTimeout(() => {
                        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        });

        return () => {
            window.Echo.leave(`chat.${conversationId}`);
        };
    }, [conversationId]);

    // -----------------------------------------------------------------------
    // AUTO SCROLL TO BOTTOM ONLY ON INITIAL LOAD OR NEW MESSAGE
    // -----------------------------------------------------------------------
    useEffect(() => {
        // Scroll to bottom on initial load
        if (isInitialLoad.current && messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' });
            isInitialLoad.current = false;
            prevMessagesLength.current = messages.length;
            return;
        }

        // Only scroll if new messages were added (not when loading old messages)
        if (messages.length > prevMessagesLength.current) {
            // Check if user is near bottom
            if (containerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                if (isNearBottom) {
                    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }

        prevMessagesLength.current = messages.length;
    }, [messages]);

    // -----------------------------------------------------------------------
    // INFINITE SCROLL — LOAD MORE WHEN SCROLLING TO TOP
    // -----------------------------------------------------------------------
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        // Load more when scrolling to top
        if (scrollTop <= 0) {
            onLoadMore();
        }

        // Show/hide scroll to bottom button
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    }, [onLoadMore]);

    // Scroll to bottom function
    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Attach scroll listener
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        node.addEventListener('scroll', handleScroll);
        return () => node.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // -----------------------------------------------------------------------
    // RENDER EACH MESSAGE
    // -----------------------------------------------------------------------
    const renderMessage = (msg: FacebookMessage) => {
        const isMine = msg.from_type === 'page';

        return (
            <div
                key={msg.id}
                className={cn(
                    'flex flex-col mb-3',
                    isMine ? 'items-end' : 'items-start'
                )}
            >
                {/* Sender Label */}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 px-1">
                    {isMine ? 'You' : customerName}
                </span>

                {/* Message Bubble */}
                <div
                    className={cn(
                        'max-w-[70%] rounded-2xl break-words shadow-md',
                        msg.message_type === 'image' || msg.message_type === 'video' ? 'p-1' : 'px-4 py-3',
                        isMine
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                            : 'bg-white dark:bg-neutral-800 dark:text-white border border-neutral-200 dark:border-neutral-700'
                    )}
                >
                    {/* TEXT MESSAGE */}
                    {msg.message_type === 'text' && msg.message}

                    {/* EMOJI */}
                    {msg.message_type === 'emoji' && (
                        <span className="text-4xl">{msg.message}</span>
                    )}

                    {/* IMAGE */}
                    {msg.message_type === 'image' && msg.message && (
                        <img
                            src={msg.message}
                            className="rounded-lg max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-90 transition"
                            alt="image"
                            onClick={() => window.open(msg.message, '_blank')}
                        />
                    )}

                    {/* AUDIO */}
                    {(msg.message_type === 'audio' || msg.message_type === 'voice') && msg.message && (
                        <audio controls src={msg.message} className="max-w-full"></audio>
                    )}

                    {/* VIDEO */}
                    {msg.message_type === 'video' && msg.message && (
                        <video controls src={msg.message} className="rounded-lg max-w-[320px] max-h-[320px]"></video>
                    )}
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 px-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>
        );
    };

    // -----------------------------------------------------------------------
    // MAIN RENDER
    // -----------------------------------------------------------------------
    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-6 relative bg-gradient-to-b from-gray-50/50 to-transparent dark:from-neutral-900/50"
        >
            {/* LOADING MORE MESSAGES INDICATOR */}
            <div ref={topRef} className="flex justify-center my-2">
                {loading && (
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                )}
            </div>

            {messages.map((msg) => renderMessage(msg))}

            {/* Auto-scroll anchor */}
            <div ref={bottomRef} />

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-10"
                    title="Scroll to bottom"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default MessageList;
