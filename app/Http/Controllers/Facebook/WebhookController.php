<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Facebook\FacebookWebhookController;

class WebhookController extends Controller
{
    public function handle(Request $request, FacebookWebhookController $facebookWebhook)
    {
        // All Facebook webhook traffic goes here
        return $facebookWebhook->process($request);
    }
}
