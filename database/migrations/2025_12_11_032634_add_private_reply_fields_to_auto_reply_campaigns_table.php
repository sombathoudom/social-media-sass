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
        Schema::table('auto_reply_campaigns', function (Blueprint $table) {
            // Private reply settings
            $table->boolean('enable_private_reply')->default(false)->after('enable_comment_reply');
            $table->text('private_reply_message')->nullable()->after('comment_reply_voice');
            $table->string('private_reply_image')->nullable()->after('private_reply_message');
            $table->string('private_reply_video')->nullable()->after('private_reply_image');
            $table->string('private_reply_voice')->nullable()->after('private_reply_video');
            
            // Delay settings for private reply
            $table->integer('private_reply_delay_seconds')->default(0)->after('private_reply_voice');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('auto_reply_campaigns', function (Blueprint $table) {
            $table->dropColumn([
                'enable_private_reply',
                'private_reply_message',
                'private_reply_image',
                'private_reply_video',
                'private_reply_voice',
                'private_reply_delay_seconds',
            ]);
        });
    }
};