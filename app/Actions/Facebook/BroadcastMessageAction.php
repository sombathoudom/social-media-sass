<?php
namespace App\Actions\Facebook;

use App\Jobs\Facebook\BroadcastMessageJob;

class BroadcastMessageAction
{
    public function execute($user, array $data)
    {
        BroadcastMessageJob::dispatch($user, $data);
        return true;
    }
}
