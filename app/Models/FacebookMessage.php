<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacebookMessage extends Model
{
    protected $table = 'facebook_messages';

    protected $fillable = [
        'conversation_id',
        'from_type',       // 'user' or 'page'
        'message_type',    // text|image|audio|video|file
        'message',         // text or URL
        'attachments',     // JSON structure
        'sent_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'sent_at'     => 'datetime',
    ];

    /**
     * Conversation relationship
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(FacebookConversation::class, 'conversation_id');
    }

    /**
     * Determine if the message is from the user (PSID)
     */
    public function isFromUser(): bool
    {
        return $this->from_type === 'user';
    }

    /**
     * Determine if the message is from the page
     */
    public function isFromPage(): bool
    {
        return $this->from_type === 'page';
    }

    /**
     * Attachment helpers
     */
    public function isText(): bool
    {
        return $this->message_type === 'text';
    }

    public function isImage(): bool
    {
        return $this->message_type === 'image';
    }

    public function isAudio(): bool
    {
        return $this->message_type === 'audio';
    }

    public function isVideo(): bool
    {
        return $this->message_type === 'video';
    }

    public function isFile(): bool
    {
        return $this->message_type === 'file';
    }

    /**
     * Get attachment URL (image/audio/video/file)
     */
    public function attachmentUrl(): ?string
    {
        return $this->attachments['payload']['url'] ?? null;
    }
}
