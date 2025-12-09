<?php

namespace App\Services\Facebook;

use App\Models\FacebookConversation;
use App\Models\FacebookMessage;
use Carbon\Carbon;
use Facebook\Facebook;
use Illuminate\Support\Facades\Log;

class ChatService
{
    protected Facebook $fb;

    public function __construct()
    {
        $this->fb = new Facebook([
            'app_id'                => config('services.facebook.app_id'),
            'app_secret'            => config('services.facebook.app_secret'),
            'default_graph_version' => 'v20.0',
        ]);
    }

    /**
     * Main sendMessage handler
     * Accepts: text, image, audio, video, file
     */
    public function sendMessage(FacebookConversation $conversation, array $data): FacebookMessage
    {
        $page     = $conversation->page;
        $recipient = $conversation->user->psid; // PAGE-SCOPED USER ID
        $accessToken = decrypt($page->access_token);

        // ----------------------------------------------------
        // Determine message type & content for DB
        // ----------------------------------------------------
        $messageType = 'text';
        $content     = $data['text'] ?? null;

        if (!empty($data['attachment_type'])) {
            $messageType = $data['attachment_type']; // image|audio|video|file
            $content     = $data['attachment_url'];
        }

        // ----------------------------------------------------
        // Build Facebook payload
        // ----------------------------------------------------
        // Check if conversation is within 24-hour window
        $lastMessageAt = $conversation->last_message_at;
        $isWithin24Hours = $lastMessageAt && now()->diffInHours($lastMessageAt) < 24;
        
        $payload = [
            'recipient' => [
                'id' => $recipient,
            ],
            // Use UPDATE messaging type for messages outside 24-hour window
            // This allows sending messages for customer service purposes
            'messaging_type' => $isWithin24Hours ? 'RESPONSE' : 'UPDATE',
        ];
        
        // Add message tag for messages outside 24-hour window
        if (!$isWithin24Hours) {
            $payload['tag'] = 'ACCOUNT_UPDATE'; // Allows sending updates outside 24-hour window
        }

        // TEXT ONLY
        if (!empty($data['text']) && empty($data['attachment_type'])) {
            $payload['message'] = [
                'text' => $data['text'],
            ];
        }
        // ATTACHMENT (with optional text)
        elseif (!empty($data['attachment_type']) && !empty($data['attachment_url'])) {
            // For local files, we need to upload them directly to Facebook
            $attachmentUrl = $data['attachment_url'];
            
            // Check if it's a local file path
            if (str_starts_with($attachmentUrl, asset('storage/'))) {
                // Convert asset URL to file path
                $relativePath = str_replace(asset('storage/'), '', $attachmentUrl);
                $filePath = storage_path('app/public/' . $relativePath);
                
                if (file_exists($filePath)) {
                    // Upload file directly to Facebook
                    $attachmentId = $this->uploadAttachment($filePath, $data['attachment_type'], $accessToken);
                    
                    if ($attachmentId) {
                        $payload['message'] = [
                            'attachment' => [
                                'type' => $data['attachment_type'],
                                'payload' => [
                                    'attachment_id' => $attachmentId,
                                ],
                            ],
                        ];
                    } else {
                        throw new \Exception('Failed to upload attachment to Facebook');
                    }
                } else {
                    throw new \Exception('File not found: ' . $filePath);
                }
            } else {
                // External URL - use URL method
                $payload['message'] = [
                    'attachment' => [
                        'type' => $data['attachment_type'],
                        'payload' => [
                            'url' => $attachmentUrl,
                            'is_reusable' => true,
                        ],
                    ],
                ];
            }
            
            // Add text if provided
            if (!empty($data['text'])) {
                $payload['message']['text'] = $data['text'];
            }
        }

        // ----------------------------------------------------
        // SEND TO FACEBOOK using HTTP client
        // ----------------------------------------------------
        try {
            $url = 'https://graph.facebook.com/v19.0/me/messages';
            
            Log::info('Sending message to Facebook', [
                'recipient' => $recipient,
                'type' => $messageType,
                'has_text' => !empty($payload['message']['text']),
                'has_attachment' => !empty($payload['message']['attachment']),
            ]);
            
            $response = \Illuminate\Support\Facades\Http::post($url, array_merge($payload, [
                'access_token' => $accessToken,
            ]));

            if ($response->failed()) {
                $error = $response->json('error.message', 'Unknown error');
                $errorCode = $response->json('error.code', 0);
                throw new \Exception("Facebook API Error ({$errorCode}): {$error}");
            }
            
            Log::info('Message sent to Facebook successfully', [
                'recipient' => $recipient,
                'type' => $messageType,
                'response' => $response->json(),
            ]);
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage();
            
            // Check if it's a 24-hour window error
            if (str_contains($errorMessage, 'outside of allowed window')) {
                Log::warning('Message outside 24-hour window', [
                    'recipient' => $recipient,
                    'last_message_at' => $lastMessageAt,
                    'hours_since_last_message' => $lastMessageAt ? now()->diffInHours($lastMessageAt) : 'N/A',
                ]);
                
                throw new \Exception('Cannot send message: The customer must message you first or within 24 hours of their last message. Facebook Messenger policy restricts sending messages outside this window.');
            }
            
            Log::error('Facebook Send Message Error: ' . $errorMessage, [
                'recipient' => $recipient,
                'payload' => $payload,
            ]);
            throw $e;
        }

        // ----------------------------------------------------
        // Save to DB
        // ----------------------------------------------------
        $message = FacebookMessage::create([
            'conversation_id' => $conversation->id,
            'from_type'       => 'page',
            'message_type'    => $messageType,
            'message'         => $content,
            'attachments'     => $payload['message']['attachment'] ?? null,
            'sent_at'         => Carbon::now(),
        ]);

        // Update conversation metadata
        $conversation->update([
            'last_message'    => $content,
            'last_message_at' => now(),
        ]);

        // Broadcast to frontend
        broadcast(new \App\Events\MessageSent($message))->toOthers();

        return $message;
    }

    /**
     * Upload attachment to Facebook and get attachment ID
     */
    protected function uploadAttachment(string $filePath, string $type, string $accessToken): ?string
    {
        try {
            $url = 'https://graph.facebook.com/v19.0/me/message_attachments';
            
            Log::info('Uploading attachment to Facebook', [
                'file' => basename($filePath),
                'type' => $type,
                'size' => filesize($filePath),
            ]);
            
            $response = \Illuminate\Support\Facades\Http::attach(
                'filedata',
                file_get_contents($filePath),
                basename($filePath)
            )->post($url, [
                'message' => json_encode([
                    'attachment' => [
                        'type' => $type,
                        'payload' => [
                            'is_reusable' => true,
                        ],
                    ],
                ]),
                'access_token' => $accessToken,
            ]);

            if ($response->successful()) {
                $attachmentId = $response->json('attachment_id');
                Log::info('Attachment uploaded to Facebook', [
                    'attachment_id' => $attachmentId,
                    'type' => $type,
                ]);
                return $attachmentId;
            }

            Log::error('Failed to upload attachment', [
                'response' => $response->json(),
            ]);
            return null;
        } catch (\Throwable $e) {
            Log::error('Attachment upload error: ' . $e->getMessage());
            return null;
        }
    }
}
