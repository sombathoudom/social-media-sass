<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacebookPageUser extends Model
{
    protected $table = 'facebook_page_users';

    protected $fillable = [
        'facebook_page_id',
        'psid', // Page Scoped ID
        'name',
        'profile_pic',
        'last_interaction_at',
    ];

    protected $casts = [
        'last_interaction_at' => 'datetime',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(FacebookPage::class, 'facebook_page_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(FacebookConversation::class, 'facebook_page_user_id');
    }

    public function messages()
    {
        return $this->hasManyThrough(
            FacebookMessage::class,
            FacebookConversation::class,
            'facebook_page_user_id',
            'conversation_id'
        );
    }
}