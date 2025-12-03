<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessIncomingMessageJob implements ShouldQueue
{
    public function __construct(public array $event) {}

    public function handle()
    {
        app(HandleIncomingMessageAction::class)->execute($this->event);
    }
}