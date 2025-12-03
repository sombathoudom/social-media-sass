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
}
