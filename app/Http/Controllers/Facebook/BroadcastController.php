<?php

namespace App\Http\Controllers\Facebook;

use App\Actions\Facebook\BroadcastMessageAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\BroadcastRequest;
use App\Models\FacebookBroadcast;
use Inertia\Inertia;

class BroadcastController extends Controller
{
    public function index()
    {
        return Inertia::render('Facebook/Broadcast/Index', [
            'broadcasts' => FacebookBroadcast::where('user_id', auth()->id())
                ->with('page')
                ->latest()
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Facebook/Broadcast/Create', [
            'pages' => auth()->user()->facebookPages()->get(),
        ]);
    }

    public function store(BroadcastRequest $request, BroadcastMessageAction $action)
    {
        $broadcast = FacebookBroadcast::create([
            'user_id' => auth()->id(),
            'facebook_page_id' => $request->facebook_page_id,
            'title' => $request->title,
            'message' => $request->message,
        ]);

        $page = $broadcast->page;

        $action->execute(auth()->user(), [
            'page_id' => $page->page_id,
            'message' => $broadcast->message,
            'page_token' => $page->access_token,
        ]);

        return redirect()->route('fb.broadcast.index')
            ->with('success', 'Broadcast queued successfully.');
    }
}
