<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Facebook\{
    FacebookAuthController,
    PageController,
    PostController,
    AutoReplyController,
    BroadcastController,
    LiveStreamController,
    ChatController,
    FacebookWebhookController,
    CommentTemplateController,
    CommentManagerController
};
use App\Services\Facebook\WebhookHandlerService;

/*
|--------------------------------------------------------------------------
| Facebook Authentication
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])
    ->prefix('facebook/chat')
    ->name('fb.chat.')
    ->group(function () {

        Route::get('/conversations', [ChatController::class, 'conversations'])
            ->name('conversations');
        // Main Chat Page (sidebar + messages)
        Route::get('/', [ChatController::class, 'index'])
            ->name('index');

        // Switch conversation
        Route::get('/{conversation}', [ChatController::class, 'show'])
            ->name('show');

        // Load more messages (pagination)
        Route::get('/{conversation}/messages', [ChatController::class, 'messages'])
            ->name('messages');

        // Send a message
        Route::post('/{conversation}/send', [ChatController::class, 'send'])
            ->name('send');
        
    });


Route::middleware(['auth'])
    ->prefix('facebook/pages/{page}/posts')
    ->name('fb.posts.')
    ->group(function () {
        Route::get('/', [PostController::class, 'index'])->name('index');
        Route::get('/fetch', [PostController::class, 'fetch'])->name('fetch');
        Route::post('/create', [PostController::class, 'store'])->name('store');
        Route::get('/{post}/comments', [PostController::class, 'comments'])->name('comments');
    });

Route::middleware(['auth'])
    ->prefix('facebook/pages/{page}/comments')
    ->name('fb.comments.')
    ->group(function () {
        Route::post('/{comment}/reply', [PostController::class, 'replyToComment'])->name('reply');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('/api/upload', [\App\Http\Controllers\Api\UploadController::class, 'upload'])->name('api.upload');
});

Route::middleware(['auth'])->group(function () {

    // Redirect user to FB
    Route::get('/facebook/connect', [FacebookAuthController::class, 'connect'])
        ->name('fb.connect');

    // Callback from FB
    Route::get('/facebook/callback', [FacebookAuthController::class, 'callback'])
        ->name('fb.callback');


    /*
    |--------------------------------------------------------------------------
    | Facebook Pages
    |--------------------------------------------------------------------------
    */

    Route::get('/facebook/pages', [PageController::class, 'index'])
        ->name('fb.pages');

    Route::post('/facebook/pages/sync', [PageController::class, 'syncMorePages'])
        ->name('fb.pages.sync');

    Route::post('/facebook/pages/subscribe-webhook', [PageController::class, 'subscribeWebhook'])
        ->name('fb.pages.subscribe-webhook');

    Route::post('/facebook/pages/{page}/subscribe-webhook', [PageController::class, 'subscribePageWebhook'])
        ->name('fb.pages.subscribe-page-webhook');

    Route::post('/facebook/pages/switch', [PageController::class, 'switch'])
        ->name('fb.pages.switch');


    /*
    |--------------------------------------------------------------------------
    | Auto Reply System
    |--------------------------------------------------------------------------
    */

    Route::prefix('facebook/autoreply')->group(function () {

        Route::get('/', [AutoReplyController::class, 'index'])
            ->name('fb.autoreply.index');

        Route::get('/create', [AutoReplyController::class, 'create'])
            ->name('fb.autoreply.create');

        Route::post('/store', [AutoReplyController::class, 'store'])
            ->name('fb.autoreply.store');

        Route::get('/{rule}/edit', [AutoReplyController::class, 'edit'])
            ->name('fb.autoreply.edit');

        Route::put('/{rule}', [AutoReplyController::class, 'update'])
            ->name('fb.autoreply.update');

        Route::delete('/{rule}', [AutoReplyController::class, 'destroy'])
            ->name('fb.autoreply.destroy');
    });


    /*
    |--------------------------------------------------------------------------
    | Broadcast System
    |--------------------------------------------------------------------------
    */

    Route::prefix('facebook/broadcast')->group(function () {

        Route::get('/', [BroadcastController::class, 'index'])
            ->name('fb.broadcast.index');

        Route::get('/create', [BroadcastController::class, 'create'])
            ->name('fb.broadcast.create');

        Route::post('/store', [BroadcastController::class, 'store'])
            ->name('fb.broadcast.store');
    });


    /*
    |--------------------------------------------------------------------------
    | Live Monitor
    |--------------------------------------------------------------------------
    */

    Route::get('/facebook/live/monitor', [LiveStreamController::class, 'monitor'])
        ->name('fb.live.monitor');

    // Polling endpoint for live video comments
    Route::post('/facebook/live/fetch', [LiveStreamController::class, 'fetch'])
        ->name('fb.live.fetch');


    /*
    |--------------------------------------------------------------------------
    | Comment Templates
    |--------------------------------------------------------------------------
    */

    Route::prefix('facebook/comment-templates')->name('fb.comment-templates.')->group(function () {
        Route::get('/', [CommentTemplateController::class, 'index'])->name('index');
        Route::post('/', [CommentTemplateController::class, 'store'])->name('store');
        Route::put('/{template}', [CommentTemplateController::class, 'update'])->name('update');
        Route::delete('/{template}', [CommentTemplateController::class, 'destroy'])->name('destroy');
    });


    /*
    |--------------------------------------------------------------------------
    | Comment Manager / Auto Reply Campaigns
    |--------------------------------------------------------------------------
    */

    Route::prefix('facebook/comment-manager')->name('fb.comment-manager.')->group(function () {
        Route::get('/', [CommentManagerController::class, 'index'])->name('index');
        Route::get('/create', [CommentManagerController::class, 'create'])->name('create');
        Route::post('/', [CommentManagerController::class, 'store'])->name('store');
        Route::get('/{campaign}/edit', [CommentManagerController::class, 'edit'])->name('edit');
        Route::put('/{campaign}', [CommentManagerController::class, 'update'])->name('update');
        Route::delete('/{campaign}', [CommentManagerController::class, 'destroy'])->name('destroy');
        Route::get('/{campaign}/logs', [CommentManagerController::class, 'logs'])->name('logs');
    });
});


/*
|--------------------------------------------------------------------------
| Facebook Webhook (Public)
|--------------------------------------------------------------------------
| MUST be public (no auth)
| Facebook sends GET for verify
| and POST for events
|--------------------------------------------------------------------------
*/
//Route::get('/facebook/webhook', [\App\Http\Controllers\Facebook\FacebookWebhookController::class, 'verify']);
//Route::post('/facebook/webhook', [\App\Http\Controllers\Facebook\FacebookWebhookController::class, 'handle']);

// Route::match(['GET', 'POST'], '/facebook/webhook', function () {

//     $service = app(WebhookHandlerService::class);

//     // GET == Verify
//     if (request()->isMethod('get')) {
//         return $service->verifyWebhook(request());
//     }

//     // POST == Events
//     if (request()->isMethod('post')) {
//         $service->handleEvent(request()->all());
//         return response('EVENT_RECEIVED', 200);
//     }

//     return response('METHOD_NOT_ALLOWED', 405);
// });

// Route::match(['GET', 'POST'], '/facebook/webhook', [FacebookWebhookController::class, 'handle'])
//     ->name('facebook.webhook');
