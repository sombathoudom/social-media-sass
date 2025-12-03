<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacebookConversation extends Model
{
    protected $table = 'facebook_conversations';

    protected $fillable = [
        'facebook_page_id',
        'facebook_page_user_id',
        'unread_count',
        'last_message',
        'last_message_at',
    ];

    public function page()
    {
        return $this->belongsTo(FacebookPage::class, 'facebook_page_id');
    }

    public function user()
    {
        return $this->belongsTo(FacebookPageUser::class, 'facebook_page_user_id');
    }

    public function messages()
    {
        return $this->hasMany(FacebookMessage::class, 'conversation_id');
    }

    public function lastMessage()
    {
        return $this->hasOne(FacebookMessage::class, 'conversation_id')
            ->latestOfMany();
    }
}