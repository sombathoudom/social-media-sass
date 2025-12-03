<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacebookUser extends Model
{
    protected $fillable = [
        'facebook_id',
        'name',
        'avatar',
        'gender',
        'locale',
        'synced_at',
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
