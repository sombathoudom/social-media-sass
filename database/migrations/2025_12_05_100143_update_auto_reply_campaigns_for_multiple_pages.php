<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auto_reply_campaigns', function (Blueprint $table) {
            // Drop the old facebook_page_id foreign key and column
            $table->dropForeign(['facebook_page_id']);
            $table->dropColumn('facebook_page_id');
            
            // Add the new apply_to_all_pages column
            $table->boolean('apply_to_all_pages')->default(false)->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('auto_reply_campaigns', function (Blueprint $table) {
            $table->dropColumn('apply_to_all_pages');
            $table->foreignId('facebook_page_id')->after('user_id')->constrained()->onDelete('cascade');
        });
    }
};
