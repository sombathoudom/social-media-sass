'use client';

import { FC, useEffect, useRef, useCallback } from 'react';
import { FacebookMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Props {
    messages: FacebookMessage[];
    loading: boolean;
    conversationId: number;
    onLoadMore: () => void;
}

const MessageList: FC<Props> = ({
    messages,
    loading,
    conversationId,
    onLoadMore,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);

    // -----------------------------------------------------------------------
    // REAL-TIME LISTENER FOR INCOMING MESSAGES
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!conversationId) return;

        const channel = window.Echo.channel(`chat.${conversationId}`);

        channel.listen('.new.message', (event: FacebookMessage) => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => {
            window.Echo.leave(`chat.${conversationId}`);
        };
    }, [conversationId]);

    // -----------------------------------------------------------------------
    // AUTO SCROLL TO BOTTOM ON NEW MESSAGES
    // -----------------------------------------------------------------------
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // -----------------------------------------------------------------------
    // INFINITE SCROLL — LOAD MORE WHEN SCROLLING TO TOP
    // -----------------------------------------------------------------------
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const { scrollTop } = containerRef.current;

        if (scrollTop <= 0) {
            onLoadMore();
        }
    }, [onLoadMore]);

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
                    'max-w-[70%] p-3 rounded-lg mb-3 break-words',
                    isMine
                        ? 'ml-auto bg-blue-600 text-white'
                        : 'mr-auto bg-neutral-200 dark:bg-neutral-700 dark:text-white'
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
                        className="rounded-lg max-w-full"
                        alt="image"
                    />
                )}

                {/* VOICE */}
                {msg.message_type === 'voice' && msg.message && (
                    <audio controls src={msg.message}></audio>
                )}
            </div>
        );
    };

    // -----------------------------------------------------------------------
    // MAIN RENDER
    // -----------------------------------------------------------------------
    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 relative"
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
        </div>
    );
};

export default MessageList;
