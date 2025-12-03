<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacebookLiveVideo extends Model
{
    protected $fillable = [
        'facebook_page_id',
        'live_video_id',
    ];

    public function page()
    {
        return $this->belongsTo(FacebookPage::class, 'facebook_page_id');
    }
}
