<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AutoReplyInboxRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'facebook_page_id' => 'required|integer|exists:facebook_pages,id',
            'trigger_keyword' => 'required|string|max:255',
            'reply_message' => 'required|string|max:2000',
        ];
    }
}
