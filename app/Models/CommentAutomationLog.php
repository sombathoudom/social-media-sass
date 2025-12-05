<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentAutomationLog extends Model
{
    protected $fillable = [
        'auto_reply_campaign_id',
        'facebook_page_id',
        'comment_id',
        'user_id',
        'comment_text',
        'action',
        'reply_message',
        'was_offensive',
    ];

    protected $casts = [
        'was_offensive' => 'boolean',
    ];

    public function campaign()
    {
        return $this->belongsTo(AutoReplyCampaign::class, 'auto_reply_campaign_id');
    }

    public function facebookPage()
    {
        return $this->belongsTo(FacebookPage::class);
    }
}
