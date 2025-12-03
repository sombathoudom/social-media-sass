<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use App\Http\Requests\AutoReplyRequest;
use App\Models\FacebookAutoReplyRule;
use Inertia\Inertia;

class AutoReplyController extends Controller
{
    public function index()
    {
        return Inertia::render('Facebook/AutoReply/Index', [
            'rules' => FacebookAutoReplyRule::where('user_id', auth()->id())
                ->with('page')
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Facebook/AutoReply/Create', [
            'pages' => auth()->user()->facebookPages()->get(),
        ]);
    }

    public function store(AutoReplyRequest $request)
    {
        FacebookAutoReplyRule::create([
            'user_id' => auth()->id(),
            'facebook_page_id' => $request->facebook_page_id,
            'type' => $request->type,
            'trigger_keyword' => $request->trigger_keyword,
            'reply_message' => $request->reply_message,
            'enabled' => true,
        ]);

        return redirect()->route('fb.autoreply.index')
            ->with('success', 'Auto reply rule created.');
    }

    public function edit(FacebookAutoReplyRule $rule)
    {
        $this->authorize('update', $rule);

        return Inertia::render('Facebook/AutoReply/Edit', [
            'rule' => $rule,
            'pages' => auth()->user()->facebookPages()->get(),
        ]);
    }

    public function update(AutoReplyRequest $request, FacebookAutoReplyRule $rule)
    {
        $this->authorize('update', $rule);

        $rule->update($request->validated());

        return redirect()->route('fb.autoreply.index')
            ->with('success', 'Rule updated.');
    }

    public function destroy(FacebookAutoReplyRule $rule)
    {
        $this->authorize('delete', $rule);

        $rule->delete();

        return back()->with('success', 'Rule deleted.');
    }
}
