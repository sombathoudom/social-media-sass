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
}
