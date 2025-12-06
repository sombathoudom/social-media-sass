<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use App\Models\CommentTemplate;
use App\Models\FacebookPage;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class CommentTemplateController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $templates = CommentTemplate::where('user_id', auth()->id())
            ->with('facebookPage')
            ->latest()
            ->get();

        $pages = FacebookPage::where('user_id', auth()->id())->get();

        // If it's an API request (for chat templates), return JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json($templates);
        }

        return Inertia::render('Facebook/CommentTemplate/Index', [
            'templates' => $templates,
            'pages' => $pages,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'facebook_page_id' => 'required|exists:facebook_pages,id',
                'name' => 'required|string|max:255',
                'message' => 'required|string',
                'image_url' => 'nullable|url',
                'video_url' => 'nullable|url',
                'voice_url' => 'nullable|url',
            ]);

            CommentTemplate::create([
                ...$validated,
                'user_id' => auth()->id(),
            ]);

            return back()->with('success', 'Template created successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to create template: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(Request $request, CommentTemplate $template)
    {
        try {
            // Check ownership
            if ($template->user_id !== auth()->id()) {
                abort(403, 'Unauthorized');
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'message' => 'required|string',
                'image_url' => 'nullable|url',
                'video_url' => 'nullable|url',
                'voice_url' => 'nullable|url',
                'is_active' => 'boolean',
            ]);

            $template->update($validated);

            return back()->with('success', 'Template updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update template: ' . $e->getMessage());
        }
    }

    public function destroy(CommentTemplate $template)
    {
        try {
            // Check ownership
            if ($template->user_id !== auth()->id()) {
                abort(403, 'Unauthorized');
            }

            $template->delete();

            return back()->with('success', 'Template deleted successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete template: ' . $e->getMessage());
        }
    }
}
