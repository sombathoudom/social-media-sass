'use client';

import { FC, useEffect, useState } from 'react';
import { SavedReply, FacebookConversation } from '@/types/chat';

import fb from '@/routes/fb';
import axios from 'axios';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, MicIcon, FileTextIcon } from 'lucide-react';

interface Props {
    conversation: FacebookConversation;
    onClose: () => void;
    onSelect: (content: string) => void;
}

const TemplateModal: FC<Props> = ({ conversation, onClose, onSelect }) => {
    const [templates, setTemplates] = useState<SavedReply[]>([]);
    const [loading, setLoading] = useState(true);

    // -----------------------------------------------------------------------
    // LOAD ALL SAVED TEMPLATES
    // -----------------------------------------------------------------------
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await axios.get(fb.commentTemplates.index().url);
                setTemplates(res.data);
            } catch (error) {
                console.error('Failed to load templates:', error);
                setTemplates([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // -----------------------------------------------------------------------
    // RENDER TEMPLATE TYPE ICON
    // -----------------------------------------------------------------------
    const getIcon = (type: SavedReply['type']) => {
        switch (type) {
            case 'image':
                return <ImageIcon className="h-4 w-4" />;
            case 'voice':
                return <MicIcon className="h-4 w-4" />;
            default:
                return <FileTextIcon className="h-4 w-4" />;
        }
    };

    // -----------------------------------------------------------------------
    // MAIN RENDER
    // -----------------------------------------------------------------------
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Saved Replies</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center p-6">
                            <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && templates.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            No saved templates yet
                        </p>
                    )}

                    {/* Templates list */}
                    {!loading &&
                        templates.map((template) => (
                            <Button
                                key={template.id}
                                variant="outline"
                                className="w-full flex justify-start items-center gap-3 text-left"
                                onClick={() => onSelect(template.content)}
                            >
                                <div>{getIcon(template.type)}</div>

                                <div>
                                    <div className="font-medium">
                                        {template.title}
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                                        {template.content}
                                    </div>
                                </div>
                            </Button>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TemplateModal;
