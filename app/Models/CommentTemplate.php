<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentTemplate extends Model
{
    protected $fillable = [
        'user_id',
        'facebook_page_id',
        'name',
        'message',
        'image_url',
        'video_url',
        'voice_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facebookPage()
    {
        return $this->belongsTo(FacebookPage::class);
    }
}
