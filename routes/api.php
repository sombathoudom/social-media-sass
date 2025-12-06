<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Facebook\FacebookWebhookController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::match(['GET', 'POST'], '/facebook/webhook', [FacebookWebhookController::class, 'handle']);
