<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comment_automation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_reply_campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('facebook_page_id')->constrained()->onDelete('cascade');
            $table->string('comment_id')->index();
            $table->string('user_id');
            $table->text('comment_text');
            $table->string('action'); // replied, liked, hidden, deleted
            $table->text('reply_message')->nullable();
            $table->boolean('was_offensive')->default(false);
            $table->timestamps();

            // Prevent duplicate processing
            $table->unique(['auto_reply_campaign_id', 'comment_id'], 'campaign_comment_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_automation_logs');
    }
};
