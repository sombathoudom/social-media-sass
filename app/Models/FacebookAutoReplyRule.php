<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacebookAutoReplyRule extends Model
{
    protected $fillable = [
        'user_id',
        'facebook_page_id',
        'type',
        'trigger_keyword',
        'reply_message',
        'enabled',
    ];

    public function page()
    {
        return $this->belongsTo(FacebookPage::class, 'facebook_page_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
