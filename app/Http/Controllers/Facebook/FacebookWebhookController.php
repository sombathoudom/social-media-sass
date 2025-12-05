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

    public function handle(Request $request)
    {
        // ------------------------------------------------------------
        // 1) HANDLE VERIFY WEBHOOK (Facebook GET request)
        // ------------------------------------------------------------
        if ($request->isMethod('get')) {
            $verifyToken = config('services.facebook.verify_token');
            $mode        = $request->input('hub.mode');
            $token       = $request->input('hub.verify_token');
            $challenge   = $request->input('hub.challenge');

            if ($mode === 'subscribe' && $token === $verifyToken) {
                return response($challenge, 200);
            }

            return response("Invalid verify token", 403);
        }

        // ------------------------------------------------------------
        // 2) HANDLE EVENTS (Facebook POST request)
        // ------------------------------------------------------------
        if ($request->isMethod('post')) {

            // Dispatch to your service or handle directly here
            app(\App\Services\Facebook\WebhookHandlerService::class)
                ->handleEvent($request->all());

            return response("EVENT_RECEIVED", 200);
        }

        return response("METHOD_NOT_ALLOWED", 405);
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
