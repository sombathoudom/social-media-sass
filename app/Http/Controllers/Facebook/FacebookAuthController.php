<?php

namespace App\Http\Controllers\Facebook;

use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\Controller;
use App\Services\Facebook\FacebookService;
use Exception;
use Illuminate\Http\Request;

class FacebookAuthController extends Controller
{
    public function connect()
    {
        // EXPLICIT TYPE HINT TO FIX INTELEPHENSE
        /** @var \Laravel\Socialite\Two\FacebookProvider $driver */
        $driver = Socialite::driver('facebook');

        return $driver
            ->scopes([
                'email',
                'public_profile',

                // REQUIRED FOR PAGES
                'pages_show_list',
                'pages_read_engagement',
                'pages_manage_metadata',
                'pages_manage_posts',
                'pages_manage_engagement',
                'pages_read_user_content',

                // REQUIRED FOR INBOX / MESSAGES
                'pages_messaging',
                // 'pages_messaging_subscriptions'
            ])
            ->stateless()
            ->redirect();
    }

    public function callback(Request $request,FacebookService $fb)
    {
        try {
            /** @var \Laravel\Socialite\Two\User $facebookUser */
            $facebookUser = Socialite::driver('facebook')->stateless()->user();
        } catch (Exception $e) {
            dd($e);
            return redirect()
                ->route('fb.connect')
                ->with('error', 'Facebook authentication failed.');
        }
        // Save token + FB ID on current Laravel user
        $request->user()->update([
            'facebook_id'     => $facebookUser->getId(),
            'facebook_token'  => encrypt($facebookUser->token),
        ]);

        // OPTIONAL: Get long-lived token (recommended)
        $fb->exchangeForLongLivedToken($request->user());

        return redirect()->route('fb.pages')
            ->with('success', 'Facebook account connected successfully.');
    
    }
}
