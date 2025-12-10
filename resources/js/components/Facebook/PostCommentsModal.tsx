import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Using div with overflow instead of ScrollArea
import { 
    MessageCircle, 
    Heart, 
    ExternalLink,
    Clock,
    Loader2,
    Reply,
    Send,
    ArrowUpDown,
    ThumbsUp,
    Calendar,
    RefreshCw,
    Smile
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import EmojiPicker from 'emoji-picker-react';

interface Comment {
    id: string;
    message?: string;
    created_time: string;
    from?: {
        id?: string;
        name?: string;
    };
    like_count?: number;
    permalink_url?: string;
    comments?: {
        data?: Comment[];
    };
}

interface Props {
    postId: string;
    pageId: number;
    onClose: () => void;
}

type SortOption = 'chronological' | 'reverse_chronological' | 'most_liked';

export default function PostCommentsModal({ postId, pageId, onClose }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [after, setAfter] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>('chronological');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const fetchComments = async (cursor?: string, sort?: SortOption) => {
        try {
            if (cursor) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const params = new URLSearchParams();
            if (cursor) params.append('after', cursor);
            if (sort) params.append('sort', sort);

            const url = `/facebook/pages/${pageId}/posts/${postId}/comments?${params.toString()}`;
            const response = await axios.get(url);

            console.log('Comments API response:', response.data);

            // Ensure we have valid comments data
            const commentsData = response.data.comments || [];
            
            if (cursor) {
                setComments(prev => [...prev, ...commentsData]);
            } else {
                setComments(commentsData);
            }

            setAfter(response.data.paging?.cursors?.after || null);
            setHasMore(!!response.data.paging?.next);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            // Set empty state on error
            if (!cursor) {
                setComments([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        setAfter(null);
        setHasMore(true);
        fetchComments(undefined, newSort);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setAfter(null);
        setHasMore(true);
        await fetchComments(undefined, sortBy);
        setRefreshing(false);
        toast.success('Comments refreshed!');
    };

    const handleReply = async (commentId: string) => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply message');
            return;
        }

        setSendingReply(true);
        try {
            const response = await axios.post(`/facebook/pages/${pageId}/comments/${commentId}/reply`, {
                message: replyText,
            });

            console.log('Reply response:', response.data);
            toast.success('Reply sent successfully!');
            setReplyText('');
            setReplyingTo(null);
            
            // Wait a moment for Facebook to process the reply, then refresh
            setTimeout(() => {
                fetchComments(undefined, sortBy);
            }, 2000);
        } catch (error: any) {
            console.error('Failed to send reply:', error);
            toast.error(error.response?.data?.error || 'Failed to send reply');
        } finally {
            setSendingReply(false);
        }
    };

    useEffect(() => {
        fetchComments(undefined, sortBy);
    }, []);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

        if (diffInMinutes < 60) {
            return `${Math.floor(diffInMinutes)}m ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`flex gap-3 p-3 rounded-lg ${isReply ? 'bg-blue-50 dark:bg-blue-900/10 ml-8 border-l-2 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
            <div className="flex-shrink-0">
                <div className={`${isReply ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm`}>
                    {comment.from?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${isReply ? 'text-xs' : 'text-sm'} text-gray-900 dark:text-gray-100`}>
                        {comment.from?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(comment.created_time)}
                    </span>
                </div>
                <p className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-300 mb-2`}>
                    {comment.message || 'No message content'}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {comment.like_count && comment.like_count > 0 && (
                        <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{comment.like_count}</span>
                        </div>
                    )}
                    {!isReply && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                            <Reply className="h-3 w-3 mr-1" />
                            Reply
                        </Button>
                    )}
                    {comment.permalink_url && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-gray-600 hover:text-gray-700"
                            onClick={() => window.open(comment.permalink_url, '_blank')}
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on Facebook
                        </Button>
                    )}
                </div>

                {/* Reply Form */}
                {!isReply && replyingTo === comment.id && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="relative">
                            <div className="flex items-start gap-2">
                                <div className="flex-1 relative">
                                    <Textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                            // Ctrl/Cmd + ; to toggle emoji picker
                                            if ((e.ctrlKey || e.metaKey) && e.key === ';') {
                                                e.preventDefault();
                                                setShowEmojiPicker(!showEmojiPicker);
                                            }
                                            // Enter to send (Shift+Enter for new line)
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (replyText.trim() && !sendingReply) {
                                                    handleReply(comment.id);
                                                }
                                            }
                                        }}
                                        placeholder="Write a reply... (Ctrl+; for emojis, Enter to send)"
                                        className="min-h-[60px] text-sm pr-10"
                                        disabled={sendingReply}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute bottom-2 right-2 h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        disabled={sendingReply}
                                        title="Add emoji (Ctrl+;)"
                                    >
                                        <Smile className={`h-4 w-4 ${showEmojiPicker ? 'text-blue-600' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div 
                                    ref={emojiPickerRef}
                                    className="absolute top-full left-0 z-50 mt-2 border rounded-lg bg-white dark:bg-gray-800 shadow-lg"
                                >
                                    <EmojiPicker
                                        onEmojiClick={(emoji) => {
                                            setReplyText(prev => prev + emoji.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        width={350}
                                        height={400}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                    setShowEmojiPicker(false);
                                }}
                                disabled={sendingReply}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleReply(comment.id)}
                                disabled={sendingReply || !replyText.trim()}
                            >
                                {sendingReply ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-3 w-3 mr-1" />
                                        Reply
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Post Comments
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                                <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="chronological">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Oldest First
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="reverse_chronological">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Newest First
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="most_liked">
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="h-4 w-4" />
                                            Most Liked
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="space-y-4 p-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && comments.length > 0 && (
                        <div className="space-y-4 p-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="space-y-2">
                                    {renderComment(comment)}
                                    {/* Render nested replies */}
                                    {comment.comments?.data && comment.comments.data.length > 0 && (
                                        <div className="space-y-2">
                                            {comment.comments.data.map((reply) => renderComment(reply, true))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {hasMore && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={() => fetchComments(after!, sortBy)}
                                        disabled={loadingMore}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More Comments'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && comments.length === 0 && (
                        <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                                No Comments Yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                This post doesn't have any comments.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}