<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use App\Services\Facebook\FacebookService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiveStreamController extends Controller
{
    public function monitor()
    {
        return Inertia::render('Facebook/Live/Monitor', [
            'pages' => auth()->user()->facebookPages()->get(),
        ]);
    }

    public function fetch(Request $request, FacebookService $fb)
    {
        $request->validate([
            'page_id' => 'required|string',
            'live_id' => 'required|string',
        ]);

        $token = $fb->getPageAccessToken(auth()->user(), $request->page_id);

        $comments = $fb->getLiveComments($request->live_id, $token);

        return response()->json($comments);
    }
}
