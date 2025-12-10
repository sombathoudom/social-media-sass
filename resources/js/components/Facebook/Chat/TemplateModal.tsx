'use client';

import { FC, useEffect, useState, useMemo } from 'react';
import { CommentTemplate } from '@/types/facebook';
import { FacebookConversation } from '@/types/chat';

import fb from '@/routes/fb';
import { router } from '@inertiajs/react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ImageIcon, MicIcon, FileTextIcon, Search } from 'lucide-react';

interface Props {
    conversation: FacebookConversation;
    onClose: () => void;
    onSelect: (content: string) => void;
}

const TemplateModal: FC<Props> = ({ conversation, onClose, onSelect }) => {
    const [templates, setTemplates] = useState<CommentTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // -----------------------------------------------------------------------
    // LOAD ALL SAVED TEMPLATES
    // -----------------------------------------------------------------------
    useEffect(() => {
        setLoading(true);
        
        router.get(fb.commentTemplates.index().url, {}, {
            preserveState: true,
            preserveScroll: true,
            only: ['templates'],
            onSuccess: (page: any) => {
                // Handle both array and object responses
                const data = Array.isArray(page.props.templates) ? page.props.templates : (page.props.templates?.data || []);
                setTemplates(data);
            },
            onError: (errors) => {
                console.error('Failed to load templates:', errors);
                setTemplates([]);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    }, []);

    // -----------------------------------------------------------------------
    // FILTER TEMPLATES BY SEARCH
    // -----------------------------------------------------------------------
    const filteredTemplates = useMemo(() => {
        if (!searchQuery.trim()) return templates;
        
        const query = searchQuery.toLowerCase();
        return templates.filter(template => 
            template.name.toLowerCase().includes(query) ||
            template.message.toLowerCase().includes(query)
        );
    }, [templates, searchQuery]);

    // -----------------------------------------------------------------------
    // RENDER TEMPLATE TYPE ICON
    // -----------------------------------------------------------------------
    const getIcon = (template: CommentTemplate) => {
        if (template.image_url) return <ImageIcon className="h-4 w-4 text-blue-600" />;
        if (template.voice_url) return <MicIcon className="h-4 w-4 text-purple-600" />;
        return <FileTextIcon className="h-4 w-4 text-gray-600" />;
    };

    // -----------------------------------------------------------------------
    // MAIN RENDER
    // -----------------------------------------------------------------------
    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Saved Replies</DialogTitle>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                                window.open(fb.commentTemplates.index().url, '_blank');
                            }}
                        >
                            + Create Template
                        </Button>
                    </div>
                </DialogHeader>

                {/* Search Bar */}
                {!loading && templates.length > 0 && (
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}

                <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto">
                    {/* Loading state */}
                    {loading && (
                        <div className="flex justify-center p-6">
                            <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && templates.length === 0 && (
                        <div className="text-center py-8">
                            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                                <FileTextIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No saved templates yet
                            </p>
                            <Button
                                variant="default"
                                onClick={() => {
                                    window.open(fb.commentTemplates.index().url, '_blank');
                                }}
                            >
                                Create Your First Template
                            </Button>
                        </div>
                    )}

                    {/* No search results */}
                    {!loading && templates.length > 0 && filteredTemplates.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No templates found for "{searchQuery}"
                            </p>
                        </div>
                    )}

                    {/* Templates list */}
                    {!loading &&
                        filteredTemplates.map((template) => (
                            <button
                                key={template.id}
                                className="w-full flex items-start gap-3 p-3 text-left border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-blue-50 dark:hover:bg-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                                onClick={() => {
                                    onSelect(template.message);
                                    onClose();
                                }}
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    {getIcon(template)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm mb-1 dark:text-white">
                                        {template.name}
                                    </div>

                                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {template.message}
                                    </div>
                                </div>
                            </button>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TemplateModal;
