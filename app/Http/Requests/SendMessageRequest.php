<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
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
            'conversation_id' => ['required', 'integer', 'exists:conversations,id'],
            'type' => ['required', 'in:text,image,voice'],

            // TEXT
            'message' => ['nullable', 'string', 'max:5000'],

            // IMAGE
            'image' => ['nullable', 'image', 'max:5120'], // 5MB

            // VOICE
            'audio' => ['nullable', 'file', 'mimes:webm,mp3,wav', 'max:10240'], // 10MB
        ];
    }
}
