<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedReply extends Model
{
    protected $fillable = [
        'user_id',
        'facebook_page_id',
        'title',
        'content',
        'type',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];
}
