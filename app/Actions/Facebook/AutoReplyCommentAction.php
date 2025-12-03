<?php
namespace App\Actions\Facebook;

use App\Jobs\Facebook\ProcessAutoReplyJob;

class AutoReplyCommentAction
{
    public function execute($user, array $data)
    {
        ProcessAutoReplyJob::dispatch($user, $data);
        return true;
    }
}
