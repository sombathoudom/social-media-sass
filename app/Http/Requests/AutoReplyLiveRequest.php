<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AutoReplyLiveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        return auth()->check();
    }

    public function rules()
    {
        return [
            'facebook_page_id' => 'required|integer|exists:facebook_pages,id',
            'trigger_keyword' => 'required|string|max:255',
            'reply_message' => 'required|string|max:2000',
        ];
    }
}
