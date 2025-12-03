<?php

namespace App\Actions\Facebook;

use App\Jobs\Facebook\ProcessLiveCommentJob;

class AutoReplyLiveCommentAction
{
    public function execute($user, array $data)
    {
        ProcessLiveCommentJob::dispatch($user, $data);
        return true;
    }
}
