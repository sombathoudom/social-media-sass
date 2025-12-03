<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacebookUser extends Model
{
    protected $fillable = [
        'user_id',
        'facebook_id',
        'access_token',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pages()
    {
        return $this->hasMany(FacebookPage::class);
    }
}
