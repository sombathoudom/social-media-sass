<?php

namespace App\Http\Controllers\Facebook;

use App\Actions\Facebook\SyncPagesAction;
use App\Actions\Facebook\SwitchPageAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\PageSwitchRequest;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index(SyncPagesAction $sync)
    {
        $user = auth()->user();

        $pages = $sync->execute($user);

        return Inertia::render('Facebook/Pages', [
            'pages' => $pages,
            'active_page_id' => $user->active_page_id,
        ]);
    }

    public function syncMorePages(SyncPagesAction $syncPages)
    {
        $syncPages->execute(auth()->user(), true);

        return back()->with('success', 'Pages synced successfully');
    }

    public function switch(PageSwitchRequest $request, SwitchPageAction $switch)
    {
       
        $switch->execute(auth()->user(), $request->page_id);

        return back()->with('success', 'Active page switched.');
    }
}
