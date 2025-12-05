<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auto_reply_campaigns', function (Blueprint $table) {
            $table->dropForeign(['private_template_1_id']);
            $table->dropForeign(['private_template_2_id']);
            $table->dropColumn(['private_template_1_id', 'private_template_2_id']);
        });
    }

    public function down(): void
    {
        Schema::table('auto_reply_campaigns', function (Blueprint $table) {
            $table->foreignId('private_template_1_id')->nullable()->constrained('comment_templates')->onDelete('set null');
            $table->foreignId('private_template_2_id')->nullable()->constrained('comment_templates')->onDelete('set null');
        });
    }
};
