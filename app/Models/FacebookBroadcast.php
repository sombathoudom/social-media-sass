<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacebookBroadcast extends Model
{
    protected $fillable = [
        'user_id',
        'facebook_page_id',
        'title',
        'message',
    ];

    public function page()
    {
        return $this->belongsTo(FacebookPage::class, 'facebook_page_id');
    }
}
