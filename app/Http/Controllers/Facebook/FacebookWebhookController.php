<?php

namespace App\Http\Controllers\Facebook;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\Facebook\WebhookHandlerService;

class FacebookWebhookController extends Controller
{
    // public function verify(Request $request, WebhookHandlerService $service)
    // {
    //     return $service->verifyWebhook($request);
    // }

    public function handle(Request $request)
    {
        Log::info("=== FACEBOOK WEBHOOK RECEIVED ===");

        Log::info($request->getContent());
       
        // ------------------------------------------------------------
        // 1) HANDLE VERIFY WEBHOOK (Facebook GET request)
        // ------------------------------------------------------------
        if ($request->isMethod('get')) {
            $verifyToken = "fb_webhook_verify_123456";
            $mode        = $request->input('hub_mode');
            $token       = $request->input('hub_verify_token');
            $challenge   = $request->input('hub_challenge');

            if ($mode === 'subscribe' && $token === $verifyToken) {
                return response($challenge, 200);
            }

            return response("Invalid verify token", 403);
        }
        // ------------------------------------------------------------
        // 2) HANDLE EVENTS (Facebook POST request)
        // ------------------------------------------------------------
        if ($request->isMethod('post')) {
                 Log::info("FB RAW: " . $request->getContent());
                Log::info("FB ARRAY:", $request->all());
            // // Dispatch to your service or handle directly here
            // app(\App\Services\Facebook\WebhookHandlerService::class)
            //     ->handleEvent($request->all());

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
