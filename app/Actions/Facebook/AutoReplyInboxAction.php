<?php

namespace App\Actions\Facebook;

use App\Jobs\Facebook\ProcessAutoReplyInboxJob;

class AutoReplyInboxAction
{
    public function execute($user, array $data)
    {
        ProcessAutoReplyInboxJob::dispatch($user, $data);
        return true;
    }
}
