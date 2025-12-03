'use client';

import { useState, useRef, useEffect, FC } from 'react';
import { FacebookConversation, FacebookMessage } from '@/types/chat';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmojiPicker from 'emoji-picker-react';

import { ImageIcon, MicIcon, SmileIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import fb from '@/routes/fb';

import TemplateModal from './TemplateModal';
import ImagePreview from './ImagePreview';
import AudioRecorder from './AudioRecorder';

interface Props {
    conversation: FacebookConversation;
    onSend: (msg: FacebookMessage) => void;
}

const ChatInput: FC<Props> = ({ conversation, onSend }) => {
    // Input state
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    // Toggles
    const [showEmoji, setShowEmoji] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [showAudioRecorder, setShowAudioRecorder] = useState(false);

    // Files
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // -----------------------------------------------------------------------
    // SEND TEXT
    // -----------------------------------------------------------------------
    const sendTextMessage = async () => {
        if (!text.trim()) return;

        setLoading(true);

        const res = await axios.post(fb.chat.send().url, {
            conversation_id: conversation.id,
            message: text,
            type: 'text',
        });

        setLoading(false);
        onSend(res.data);
        setText('');
    };

    // -----------------------------------------------------------------------
    // SEND IMAGE
    // -----------------------------------------------------------------------
    const sendImageMessage = async () => {
        if (!selectedImage) return;

        setLoading(true);

        const form = new FormData();
        form.append('image', selectedImage);
        form.append('conversation_id', conversation.id.toString());
        form.append('type', 'image');

        const res = await axios.post(fb.chat.send().url, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        setLoading(false);
        setSelectedImage(null);
        setShowImagePreview(false);
        onSend(res.data);
    };

    // -----------------------------------------------------------------------
    // SEND AUDIO
    // -----------------------------------------------------------------------
    const sendVoiceMessage = async (file: File) => {
        const form = new FormData();
        form.append('audio', file);
        form.append('conversation_id', conversation.id.toString());
        form.append('type', 'voice');

        setLoading(true);
        const res = await axios.post(fb.chat.send().url, form);
        setLoading(false);

        onSend(res.data);
    };

    // -----------------------------------------------------------------------
    // KEYBOARD “ENTER TO SEND”
    // -----------------------------------------------------------------------
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendTextMessage();
        }
    };

    // -----------------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------------
    return (
        <div className="border-t dark:border-neutral-800 p-4 space-y-3">

            {/* IMAGE PREVIEW */}
            {showImagePreview && selectedImage && (
                <ImagePreview
                    file={selectedImage}
                    onCancel={() => {
                        setSelectedImage(null);
                        setShowImagePreview(false);
                    }}
                    onSend={sendImageMessage}
                />
            )}

            {/* AUDIO RECORDER */}
            {showAudioRecorder && (
                <AudioRecorder
                    onCancel={() => setShowAudioRecorder(false)}
                    onSend={sendVoiceMessage}
                />
            )}

            {/* Template Modal */}
            {showTemplates && (
                <TemplateModal
                    conversation={conversation}
                    onClose={() => setShowTemplates(false)}
                    onSelect={(msg) => {
                        setText(msg);
                        setShowTemplates(false);
                    }}
                />
            )}

            <div className="flex items-center gap-2">

                {/* Emoji Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmoji(!showEmoji)}
                >
                    <SmileIcon className="h-5 w-5" />
                </Button>

                {/* Image Upload */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon className="h-5 w-5" />
                </Button>

                {/* Hidden Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            setSelectedImage(e.target.files[0]);
                            setShowImagePreview(true);
                        }
                    }}
                />

                {/* Voice Recorder */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAudioRecorder(true)}
                >
                    <MicIcon className="h-5 w-5" />
                </Button>

                {/* Templates */}
                <Button
                    variant="secondary"
                    onClick={() => setShowTemplates(true)}
                >
                    Templates
                </Button>

                {/* Text Input */}
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1"
                />

                {/* Send button */}
                <Button onClick={sendTextMessage} disabled={loading}>
                    {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                        'Send'
                    )}
                </Button>
            </div>

            {/* Emoji Picker */}
            {showEmoji && (
                <div className="bg-white dark:bg-neutral-800 rounded shadow p-2">
                    <EmojiPicker
                        open
                        onEmojiClick={(emoji) => {
                            setText((prev) => prev + emoji.emoji);
                            setShowEmoji(false);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatInput;
