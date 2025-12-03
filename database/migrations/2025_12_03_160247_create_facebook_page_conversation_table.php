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
        Schema::create('facebook_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facebook_page_id')->constrained()->onDelete('cascade');
            $table->foreignId('facebook_page_user_id')->constrained()->onDelete('cascade');
            $table->integer('unread_count')->default(0);
            $table->text('last_message')->nullable();
            // $table->integer("unread_count")->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['facebook_page_id', 'facebook_page_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_conversations');
    }
};
