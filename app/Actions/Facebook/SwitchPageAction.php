<?php

namespace App\Actions\Facebook;

use App\Models\FacebookPage;

class SwitchPageAction
{
    public function execute($user, string $pageId)
    {
        // Ensure the page belongs to this user
        $page = FacebookPage::where('user_id', $user->id)
            ->where('page_id', $pageId)
            ->firstOrFail();

        // Update active flag
        FacebookPage::where('user_id', $user->id)->update(['active' => false]);
        $page->update(['active' => true]);

        $user->update([
            'active_page_id' => $pageId
        ]);

        return $page;
    }
}
