<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        // First, create a temporary table with the new enum values
        Schema::create('facebook_messages_temp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('facebook_conversations')->onDelete('cascade');
            $table->enum('from_type', ['page', 'user']);
            $table->enum('message_type', ['text', 'image', 'voice', 'audio', 'video', 'file', 'emoji', 'template']);
            $table->longText('message')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // Copy data from old table to new table
        DB::statement('INSERT INTO facebook_messages_temp SELECT * FROM facebook_messages');

        // Drop old table
        Schema::dropIfExists('facebook_messages');

        // Rename temp table to original name
        Schema::rename('facebook_messages_temp', 'facebook_messages');

        // Re-add indexes
        Schema::table('facebook_messages', function (Blueprint $table) {
            $table->index(['conversation_id', 'id'], 'idx_conversation_messages');
            $table->index('sent_at', 'idx_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate with old enum values
        Schema::create('facebook_messages_temp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('facebook_conversations')->onDelete('cascade');
            $table->enum('from_type', ['page', 'user']);
            $table->enum('message_type', ['text', 'image', 'voice', 'emoji', 'template']);
            $table->longText('message')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        DB::statement('INSERT INTO facebook_messages_temp SELECT id, conversation_id, from_type, message_type, message, attachments, sent_at, created_at, updated_at FROM facebook_messages WHERE message_type IN ("text", "image", "voice", "emoji", "template")');

        Schema::dropIfExists('facebook_messages');
        Schema::rename('facebook_messages_temp', 'facebook_messages');

        Schema::table('facebook_messages', function (Blueprint $table) {
            $table->index(['conversation_id', 'id'], 'idx_conversation_messages');
            $table->index('sent_at', 'idx_sent_at');
        });
    }
};
