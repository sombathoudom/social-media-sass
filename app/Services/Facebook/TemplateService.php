<?php
namespace App\Services\Facebook;

use App\Models\SavedReply;

class TemplateService
{
    public function list($userId, $pageId = null)
    {
        return SavedReply::where('user_id', $userId)
            ->when($pageId, fn($q) => $q->where('facebook_page_id', $pageId))
            ->get();
    }

    public function create(array $data)
    {
        return SavedReply::create($data);
    }

    public function update(SavedReply $reply, array $data)
    {
        $reply->update($data);
        return $reply;
    }

    public function delete(SavedReply $reply)
    {
        $reply->delete();
    }
}
