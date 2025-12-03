<?php

namespace App\Http\Controllers\Facebook;

use App\Http\Controllers\Controller;
use App\Services\Facebook\WebhookHandlerService;
use Illuminate\Http\Request;

class FacebookWebhookController extends Controller
{
    public function verify(Request $request, WebhookHandlerService $service)
    {
        return $service->verifyWebhook($request);
    }

    public function handle(Request $request, WebhookHandlerService $service)
    {
        $service->handleEvent($request->all());
        return response('EVENT_RECEIVED', 200);
    }

    // public function process(Request $request)
    // {
    //     $entry = $request->input('entry')[0] ?? null;
    //     if (!$entry || !isset($entry['messaging'])) {
    //         return response('ok');
    //     }

    //     foreach ($entry['messaging'] as $event) {
    //         $this->handler->handleMessagingEvent($event);
    //     }

    //     return response('ok');
    // }


//     public function handle(Request $request, FacebookUserService $userService)
// {
//     $entry = $request->entry[0]['messaging'][0] ?? null;
//     if (!$entry) return response('ok');

//     $senderId = $entry['sender']['id'];
//     $pageId   = $entry['recipient']['id'];

//     // FETCH PAGE ACCESS TOKEN
//     $page = FacebookPage::where('page_id', $pageId)->first();
//     if (!$page) return response('ok');

//     // SYNC PROFILE
//     $fbUser = $userService->sync($senderId, $page->access_token);

//     // process incoming message...
//     // create conversation...
//     // save message...

//     return response('ok');
// }

}
