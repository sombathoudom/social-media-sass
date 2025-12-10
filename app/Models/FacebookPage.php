<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacebookPage extends Model
{
    protected $fillable = [
        'user_id',
        'page_id',
        'name',
        'access_token',
        'active',
    ];

    protected $hidden = [
        'access_token', // Never expose access token in JSON
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function autoReplyRules()
    {
        return $this->hasMany(FacebookAutoReplyRule::class);
    }

    public function broadcasts()
    {
        return $this->hasMany(FacebookBroadcast::class);
    }

    public function conversations()
    {
        return $this->hasMany(FacebookConversation::class, 'facebook_page_id');
    }

    public function pageUsers()
    {
        return $this->hasMany(FacebookPageUser::class, 'facebook_page_id');
    }

    public function autoReplyCampaigns()
    {
        return $this->belongsToMany(AutoReplyCampaign::class, 'auto_reply_campaign_facebook_page');
    }
}
