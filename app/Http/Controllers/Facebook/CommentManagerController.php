<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use App\Models\AutoReplyCampaign;
use App\Models\CommentTemplate;
use App\Models\FacebookPage;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class CommentManagerController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $campaigns = AutoReplyCampaign::where('user_id', auth()->id())
            ->with(['facebookPages', 'offensiveReplyTemplate'])
            ->latest()
            ->get();

        return Inertia::render('Facebook/CommentManager/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create()
    {
        $pages = FacebookPage::where('user_id', auth()->id())->get();
        $templates = CommentTemplate::where('user_id', auth()->id())
            ->where('is_active', true)
            ->get();

        return Inertia::render('Facebook/CommentManager/Create', [
            'pages' => $pages,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Log incoming request for debugging
            \Log::info('Comment Manager Store Request', $request->all());

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'apply_to_all_pages' => 'nullable|boolean',
                'facebook_page_ids' => 'nullable|array',
                'facebook_page_ids.*' => 'exists:facebook_pages,id',
                'delete_offensive' => 'nullable|boolean',
                'offensive_keywords' => 'nullable|string',
                'offensive_reply_template_id' => 'nullable|exists:comment_templates,id',
                'allow_multiple_replies' => 'nullable|boolean',
                'enable_comment_reply' => 'nullable|boolean',
                'like_comment' => 'nullable|boolean',
                'hide_after_reply' => 'nullable|boolean',
                'reply_type' => 'required|in:ai,generic,filtered',
                'match_type' => 'required|in:exact,any',
                'filter_keywords' => 'nullable|string',
                'comment_reply_message' => 'nullable|string',
                'comment_reply_image' => 'nullable|url',
                'comment_reply_video' => 'nullable|url',
                'comment_reply_voice' => 'nullable|url',
                'no_match_reply' => 'nullable|string',
                // Private reply fields
                'enable_private_reply' => 'nullable|boolean',
                'private_reply_message' => 'nullable|string',
                'private_reply_image' => 'nullable|url',
                'private_reply_video' => 'nullable|url',
                'private_reply_voice' => 'nullable|url',
                'private_reply_delay_seconds' => 'nullable|integer|min:0|max:3600',
            ]);

            // Set defaults for boolean fields
            $validated['apply_to_all_pages'] = $validated['apply_to_all_pages'] ?? false;
            $validated['delete_offensive'] = $validated['delete_offensive'] ?? false;
            $validated['allow_multiple_replies'] = $validated['allow_multiple_replies'] ?? false;
            $validated['enable_comment_reply'] = $validated['enable_comment_reply'] ?? true;
            $validated['like_comment'] = $validated['like_comment'] ?? false;
            $validated['hide_after_reply'] = $validated['hide_after_reply'] ?? false;
            $validated['enable_private_reply'] = $validated['enable_private_reply'] ?? false;
            $validated['private_reply_delay_seconds'] = $validated['private_reply_delay_seconds'] ?? 0;

            // Validate that at least one page is selected if not applying to all
            if (!($validated['apply_to_all_pages'] ?? false)) {
                $pageIds = $validated['facebook_page_ids'] ?? [];
                if (empty($pageIds)) {
                    return back()
                        ->withErrors(['facebook_page_ids' => 'Please select at least one page or choose "Apply to all pages"'])
                        ->withInput();
                }
            }

            $pageIds = $validated['facebook_page_ids'] ?? [];
            unset($validated['facebook_page_ids']);

            \Log::info('Creating campaign with data:', $validated);

            $campaign = AutoReplyCampaign::create([
                ...$validated,
                'user_id' => auth()->id(),
            ]);

            \Log::info('Campaign created:', ['id' => $campaign->id]);

            // Attach selected pages if not applying to all
            if (!$campaign->apply_to_all_pages && !empty($pageIds)) {
                \Log::info('Attaching pages:', $pageIds);
                $campaign->facebookPages()->attach($pageIds);
            }

            \Log::info('Redirecting to index');

            return redirect()->route('fb.comment-manager.index')
                ->with('success', 'Campaign created successfully!');
        } catch (\Exception $e) {
            \Log::error('Campaign creation failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return back()
                ->with('error', 'Failed to create campaign: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function edit(AutoReplyCampaign $campaign)
    {
        // Check ownership
        if ($campaign->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $pages = FacebookPage::where('user_id', auth()->id())->get();
        $templates = CommentTemplate::where('user_id', auth()->id())
            ->where('is_active', true)
            ->get();

        return Inertia::render('Facebook/CommentManager/Edit', [
            'campaign' => $campaign->load(['facebookPages', 'offensiveReplyTemplate']),
            'pages' => $pages,
            'templates' => $templates,
        ]);
    }

    public function update(Request $request, AutoReplyCampaign $campaign)
    {
        try {
            // Check ownership
            if ($campaign->user_id !== auth()->id()) {
                abort(403, 'Unauthorized');
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'apply_to_all_pages' => 'boolean',
                'facebook_page_ids' => 'nullable|array',
                'facebook_page_ids.*' => 'exists:facebook_pages,id',
                'delete_offensive' => 'boolean',
                'offensive_keywords' => 'nullable|string',
                'offensive_reply_template_id' => 'nullable|exists:comment_templates,id',
                'allow_multiple_replies' => 'boolean',
                'enable_comment_reply' => 'boolean',
                'like_comment' => 'boolean',
                'hide_after_reply' => 'boolean',
                'reply_type' => 'required|in:ai,generic,filtered',
                'match_type' => 'required|in:exact,any',
                'filter_keywords' => 'nullable|string',
                'comment_reply_message' => 'nullable|string',
                'comment_reply_image' => 'nullable|url',
                'comment_reply_video' => 'nullable|url',
                'comment_reply_voice' => 'nullable|url',
                'no_match_reply' => 'nullable|string',
                'is_active' => 'boolean',
                // Private reply fields
                'enable_private_reply' => 'boolean',
                'private_reply_message' => 'nullable|string',
                'private_reply_image' => 'nullable|url',
                'private_reply_video' => 'nullable|url',
                'private_reply_voice' => 'nullable|url',
                'private_reply_delay_seconds' => 'nullable|integer|min:0|max:3600',
            ]);

            // Validate that at least one page is selected if not applying to all
            if (!($validated['apply_to_all_pages'] ?? false)) {
                $pageIds = $validated['facebook_page_ids'] ?? [];
                if (empty($pageIds)) {
                    return back()
                        ->withErrors(['facebook_page_ids' => 'Please select at least one page or choose "Apply to all pages"'])
                        ->withInput();
                }
            }

            $pageIds = $validated['facebook_page_ids'] ?? [];
            unset($validated['facebook_page_ids']);

            $campaign->update($validated);

            // Sync pages
            if (!$campaign->apply_to_all_pages) {
                $campaign->facebookPages()->sync($pageIds);
            } else {
                $campaign->facebookPages()->detach();
            }

            return redirect()->route('fb.comment-manager.index')
                ->with('success', 'Campaign updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to update campaign: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(AutoReplyCampaign $campaign)
    {
        try {
            // Check ownership
            if ($campaign->user_id !== auth()->id()) {
                abort(403, 'Unauthorized');
            }

            $campaign->delete();

            return back()->with('success', 'Campaign deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete campaign: ' . $e->getMessage());
        }
    }

    public function logs(AutoReplyCampaign $campaign)
    {
        // Check ownership
        if ($campaign->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $logs = \App\Models\CommentAutomationLog::where('auto_reply_campaign_id', $campaign->id)
            ->with('facebookPage')
            ->latest()
            ->paginate(50);

        return Inertia::render('Facebook/CommentManager/Logs', [
            'campaign' => $campaign,
            'logs' => $logs,
        ]);
    }
}
