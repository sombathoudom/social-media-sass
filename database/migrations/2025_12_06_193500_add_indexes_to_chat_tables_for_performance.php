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
        Schema::table('facebook_conversations', function (Blueprint $table) {
            // Index for faster conversation queries
            $table->index(['facebook_page_id', 'last_message_at'], 'idx_page_last_message');
            $table->index(['facebook_page_id', 'unread_count'], 'idx_page_unread');
            $table->index('last_message_at', 'idx_last_message_at');
        });

        Schema::table('facebook_messages', function (Blueprint $table) {
            // Index for faster message queries
            $table->index(['conversation_id', 'id'], 'idx_conversation_messages');
            $table->index('sent_at', 'idx_sent_at');
        });

        Schema::table('facebook_pages', function (Blueprint $table) {
            // Index for faster page lookups
            $table->index(['user_id', 'page_id'], 'idx_user_page');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facebook_conversations', function (Blueprint $table) {
            $table->dropIndex('idx_page_last_message');
            $table->dropIndex('idx_page_unread');
            $table->dropIndex('idx_last_message_at');
        });

        Schema::table('facebook_messages', function (Blueprint $table) {
            $table->dropIndex('idx_conversation_messages');
            $table->dropIndex('idx_sent_at');
        });

        Schema::table('facebook_pages', function (Blueprint $table) {
            $table->dropIndex('idx_user_page');
        });
    }
};
