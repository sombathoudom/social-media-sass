<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutoReplyCampaign extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'apply_to_all_pages',
        'delete_offensive',
        'offensive_keywords',
        'offensive_reply_template_id',
        'allow_multiple_replies',
        'enable_comment_reply',
        'like_comment',
        'hide_after_reply',
        'reply_type',
        'match_type',
        'filter_keywords',
        'comment_reply_message',
        'comment_reply_image',
        'comment_reply_video',
        'comment_reply_voice',
        'no_match_reply',
        'is_active',
    ];

    protected $casts = [
        'apply_to_all_pages' => 'boolean',
        'delete_offensive' => 'boolean',
        'allow_multiple_replies' => 'boolean',
        'enable_comment_reply' => 'boolean',
        'like_comment' => 'boolean',
        'hide_after_reply' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facebookPages()
    {
        return $this->belongsToMany(FacebookPage::class, 'auto_reply_campaign_facebook_page');
    }

    public function offensiveReplyTemplate()
    {
        return $this->belongsTo(CommentTemplate::class, 'offensive_reply_template_id');
    }

    public function getOffensiveKeywordsArray()
    {
        return $this->offensive_keywords ? explode(',', $this->offensive_keywords) : [];
    }

    public function getFilterKeywordsArray()
    {
        return $this->filter_keywords ? explode(',', $this->filter_keywords) : [];
    }
}
