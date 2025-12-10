<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Facebook\FacebookWebhookController;
use App\Http\Controllers\Facebook\PostController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::match(['GET', 'POST'], '/facebook/webhook', [FacebookWebhookController::class, 'handle']);
