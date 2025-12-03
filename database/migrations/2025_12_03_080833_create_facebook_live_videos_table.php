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
        Schema::create('facebook_live_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facebook_page_id')->constrained('facebook_pages')->onDelete('cascade');
            $table->string('live_video_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_live_videos');
    }
};
