<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('facebook_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('facebook_conversations')->onDelete('cascade');

            $table->enum('from_type', ['page', 'user']); // who sent it
            $table->enum('message_type', ['text', 'image', 'voice', 'emoji', 'template']);

            $table->longText('message')->nullable(); // text or url
            $table->json('attachments')->nullable(); // FB attachments
            $table->timestamp('sent_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_messages');
    }
};
