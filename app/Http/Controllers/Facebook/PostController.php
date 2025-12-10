<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use App\Models\FacebookPage;
use App\Services\Facebook\FacebookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PostController extends Controller
{
    public function __construct(
        protected FacebookService $facebookService
    ) {}

    /**
     * Show posts page for a specific Facebook page
     */
    public function index(Request $request, $pageId)
    {
        $page = FacebookPage::where('id', $pageId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return Inertia::render('Facebook/Posts/Index', [
            'page' => $page,
        ]);
    }

    /**
     * Fetch posts from Facebook API using FacebookService
     */
    public function fetch(Request $request, $pageId)
    {
        $page = FacebookPage::where('id', $pageId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        try {
            $accessToken = decrypt($page->access_token);
            $after = $request->query('after');

            $result = $this->facebookService->getPagePosts(
                $page->page_id,
                $accessToken,
                12,
                $after
            );

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Error fetching posts', [
                'page_id' => $pageId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching posts',
            ], 500);
        }
    }

    /**
     * Fetch comments for a specific post
     */
    public function comments(Request $request, $pageId, $postId)
    {
        $page = FacebookPage::where('id', $pageId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        try {
            $accessToken = decrypt($page->access_token);
            $after = $request->query('after');
            $sort = $request->query('sort', 'chronological');

            $result = $this->facebookService->getPostComments(
                $postId,
                $accessToken,
                12,
                $after,
                $sort
            );

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Error fetching comments', [
                'page_id' => $pageId,
                'post_id' => $postId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching comments',
            ], 500);
        }
    }

    /**
     * Reply to a comment
     */
    public function replyToComment(Request $request, $pageId, $commentId)
    {
        $page = FacebookPage::where('id', $pageId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $validated = $request->validate([
            'message' => 'required|string|max:8000',
        ]);

        try {
            $accessToken = decrypt($page->access_token);

            $result = $this->facebookService->replyToComment(
                $commentId,
                $validated['message'],
                $accessToken
            );

            return response()->json([
                'success' => true,
                'reply_id' => $result['id'] ?? null,
                'message' => 'Reply sent successfully!',
            ]);

        } catch (\Exception $e) {
            Log::error('Error replying to comment', [
                'page_id' => $pageId,
                'comment_id' => $commentId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to send reply: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new post on Facebook page
     */
    public function store(Request $request, $pageId)
    {
        $page = FacebookPage::where('id', $pageId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $validated = $request->validate([
            'message' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'file|image|max:10240', // 10MB per image
            'photo_captions' => 'nullable|array',
            'photo_captions.*' => 'nullable|string',
            'video' => 'nullable|file|mimes:mp4,mov,avi|max:102400', // 100MB
        ]);

        try {
            $postData = [
                'message' => $validated['message'] ?? '',
            ];

            // Upload photos to storage and store paths
            if ($request->hasFile('photos')) {
                $photoPaths = [];
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('posts', 'public');
                    $photoPaths[] = $path; // Store relative path, not URL
                }
                $postData['photo_paths'] = $photoPaths;
                $postData['photo_captions'] = $validated['photo_captions'] ?? [];
            }

            // Upload video to storage and store path
            if ($request->hasFile('video')) {
                $path = $request->file('video')->store('posts/videos', 'public');
                $postData['video_path'] = $path; // Store relative path, not URL
            }

            // Dispatch job to post to Facebook
            \App\Jobs\CreateFacebookPostJob::dispatch(
                $page->id,
                $page->page_id,
                decrypt($page->access_token),
                $postData
            );

            return response()->json([
                'success' => true,
                'message' => 'Post is being created...',
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating post', [
                'page_id' => $pageId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to create post: ' . $e->getMessage(),
            ], 500);
        }
    }
}
