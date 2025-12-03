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
        Schema::create('facebook_page_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facebook_page_id')->constrained()->onDelete('cascade');
            $table->string('psid')->index(); // Facebook user ID
            $table->string('name')->nullable();
            $table->string('profile_pic')->nullable();
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamps();

            $table->unique(['facebook_page_id', 'psid']); // one FB user per page
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_page_users');
    }
};
