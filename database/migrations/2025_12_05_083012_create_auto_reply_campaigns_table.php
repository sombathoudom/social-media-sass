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
        Schema::create('auto_reply_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->boolean('apply_to_all_pages')->default(false);
            
            // Offensive comment settings
            $table->boolean('delete_offensive')->default(false);
            $table->text('offensive_keywords')->nullable();
            $table->foreignId('offensive_reply_template_id')->nullable()->constrained('comment_templates')->onDelete('set null');
            $table->boolean('allow_multiple_replies')->default(false);
            
            // Comment reply settings
            $table->boolean('enable_comment_reply')->default(true);
            $table->boolean('like_comment')->default(false);
            $table->boolean('hide_after_reply')->default(false);
            
            // Reply type: ai, generic, filtered
            $table->enum('reply_type', ['ai', 'generic', 'filtered'])->default('filtered');
            
            // Filter settings
            $table->enum('match_type', ['exact', 'any'])->default('any');
            $table->text('filter_keywords')->nullable();
            
            // Reply content
            $table->text('comment_reply_message')->nullable();
            $table->string('comment_reply_image')->nullable();
            $table->string('comment_reply_video')->nullable();
            $table->string('comment_reply_voice')->nullable();
            
            // Private message templates (max 2)
            $table->foreignId('private_template_1_id')->nullable()->constrained('comment_templates')->onDelete('set null');
            $table->foreignId('private_template_2_id')->nullable()->constrained('comment_templates')->onDelete('set null');
            
            // No match reply
            $table->text('no_match_reply')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auto_reply_campaigns');
    }
};
