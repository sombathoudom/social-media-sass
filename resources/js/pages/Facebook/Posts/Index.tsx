import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FacebookPage } from '@/types/facebook';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CreatePostModal from '@/components/Facebook/CreatePostModal';
import PostCommentsModal from '@/components/Facebook/PostCommentsModal';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    ExternalLink,
    Calendar,
    Image as ImageIcon,
    Video,
    FileText,
    Loader2,
    Plus
} from 'lucide-react';

interface Post {
    id: string;
    message?: string;
    full_picture?: string;
    created_time: string;
    permalink_url: string;
    status_type?: string;
    types?: string;
    likes?: { summary: { total_count: number } };
    comments?: { summary: { total_count: number } };
    shares?: { count: number };
}

interface Props {
    page: FacebookPage;
}

export default function PostsIndex({ page }: Props) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [after, setAfter] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);

    const fetchPosts = (cursor?: string) => {
        if (cursor) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        const params: Record<string, string> = {};
        if (cursor) params.after = cursor;

        router.get(`/facebook/pages/${page.id}/posts/fetch`, params, {
            preserveState: true,
            preserveScroll: true,
            only: ['posts', 'paging'],
            onSuccess: (page: any) => {
                if (cursor) {
                    setPosts(prev => [...prev, ...page.props.posts]);
                } else {
                    setPosts(page.props.posts);
                }

                setAfter(page.props.paging?.cursors?.after || null);
                setHasMore(!!page.props.paging?.next);
            },
            onError: (errors) => {
                console.error('Failed to fetch posts:', errors);
            },
            onFinish: () => {
                setLoading(false);
                setLoadingMore(false);
            }
        });
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const getPostTypeIcon = (post: Post) => {
        if (post.status_type === 'added_video') return <Video className="h-4 w-4" />;
        if (post.full_picture) return <ImageIcon className="h-4 w-4" />;
        return <FileText className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    return (
        <AppLayout>
            <Head title={`Posts - ${page.name}`} />

            <div className="container mx-auto px-6 py-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {page.name}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                View and manage your Facebook posts
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Post
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.open(`https://facebook.com/${page.page_id}`, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View on Facebook
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Create Post Modal */}
                {showCreateModal && (
                    <CreatePostModal
                        pageId={page.id}
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            fetchPosts(); // Refresh posts
                        }}
                    />
                )}

                {/* Comments Modal */}
                {selectedPostForComments && (
                    <PostCommentsModal
                        postId={selectedPostForComments}
                        pageId={page.id}
                        onClose={() => setSelectedPostForComments(null)}
                    />
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-0">
                                    <Skeleton className="h-64 w-full rounded-t-lg" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Posts Grid */}
                {!loading && posts.length > 0 && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <Card 
                                    key={post.id} 
                                    className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
                                >
                                    <CardContent className="p-0">
                                        {/* Post Image/Video */}
                                        {post.full_picture && (
                                            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                                <img
                                                    src={post.full_picture}
                                                    alt="Post"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full p-2">
                                                    {getPostTypeIcon(post)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Post Content */}
                                        <div className="p-4 space-y-3">
                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(post.created_time)}
                                            </div>

                                            {/* Message */}
                                            {post.message && (
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                                    {post.message}
                                                </p>
                                            )}

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 pt-2 border-t dark:border-gray-700">
                                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                    <Heart className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {post.likes?.summary?.total_count || 0}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedPostForComments(post.id)}
                                                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {post.comments?.summary?.total_count || 0}
                                                    </span>
                                                </button>

                                            </div>

                                            {/* View Post Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => window.open(post.permalink_url, '_blank')}
                                            >
                                                <ExternalLink className="h-3 w-3 mr-2" />
                                                View Post
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={() => fetchPosts(after!)}
                                    disabled={loadingMore}
                                    size="lg"
                                    className="min-w-[200px]"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Load More Posts'
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Empty State */}
                {!loading && posts.length === 0 && (
                    <div className="text-center py-16">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto mb-6">
                            <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No Posts Found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            This page doesn't have any posts yet.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
