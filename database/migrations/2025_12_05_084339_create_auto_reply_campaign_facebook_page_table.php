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
        Schema::create('auto_reply_campaign_facebook_page', function (Blueprint $table) {
            $table->foreignId('auto_reply_campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('facebook_page_id')->constrained()->onDelete('cascade');
            $table->primary(['auto_reply_campaign_id', 'facebook_page_id'], 'campaign_page_primary');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auto_reply_campaign_facebook_page');
    }
};
