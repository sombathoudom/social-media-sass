'use client';

import { useState, useRef, FC } from 'react';
import { FacebookConversation, FacebookMessage } from '@/types/chat';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmojiPicker from 'emoji-picker-react';

import { ImageIcon, MicIcon, SmileIcon, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // -----------------------------------------------------------------------
    // SEND TEXT
    // -----------------------------------------------------------------------
    const sendTextMessage = () => {
        if (!text.trim()) return;

        setLoading(true);

        router.post(fb.chat.send(conversation.id).url, {
            text: text,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                onSend(page.props.message);
                setText('');
            },
            onError: (errors) => {
                console.error('Failed to send message:', errors);
                const errorMessage = Object.values(errors)[0] as string || 'Failed to send message';
                alert(errorMessage);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    // -----------------------------------------------------------------------
    // SEND IMAGE(S)
    // -----------------------------------------------------------------------
    const sendImageMessage = () => {
        if (selectedImages.length === 0) return;

        setLoading(true);

        const form = new FormData();
        
        if (selectedImages.length === 1) {
            form.append('image', selectedImages[0]);
        } else {
            selectedImages.forEach((img) => {
                form.append('images[]', img);
            });
        }
        form.append('attachment_type', 'image');

        router.post(fb.chat.send(conversation.id).url, form, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                onSend(page.props.message);
                setSelectedImages([]);
                setShowImagePreview(false);
            },
            onError: (errors) => {
                console.error('Failed to send image:', errors);
                alert('Failed to send image. Please try again.');
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    // -----------------------------------------------------------------------
    // SEND AUDIO/VOICE
    // -----------------------------------------------------------------------
    const sendVoiceMessage = (file: File) => {
        setLoading(true);

        const form = new FormData();
        form.append('audio', file);
        form.append('attachment_type', 'voice'); // Changed to 'voice' to match DB constraint

        router.post(fb.chat.send(conversation.id).url, form, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                onSend(page.props.message);
            },
            onError: (errors) => {
                console.error('Failed to send voice message:', errors);
                alert('Failed to send voice message. Please try again.');
            },
            onFinish: () => {
                setLoading(false);
            }
        });
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
            {showImagePreview && selectedImages.length > 0 && (
                <ImagePreview
                    files={selectedImages}
                    onCancel={() => {
                        setSelectedImages([]);
                        setShowImagePreview(false);
                    }}
                    onSend={sendImageMessage}
                    onRemove={(index) => {
                        const newImages = selectedImages.filter((_, i) => i !== index);
                        setSelectedImages(newImages);
                        if (newImages.length === 0) {
                            setShowImagePreview(false);
                        }
                    }}
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
                        // Auto-fill the text input with template message
                        setText(msg);
                        // Close the modal
                        setShowTemplates(false);
                        // Focus on the input field
                        setTimeout(() => {
                            document.querySelector<HTMLInputElement>('input[placeholder="Type your message..."]')?.focus();
                        }, 100);
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
                    accept="image/*,.heic"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            const files = Array.from(e.target.files);
                            setSelectedImages(files);
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
