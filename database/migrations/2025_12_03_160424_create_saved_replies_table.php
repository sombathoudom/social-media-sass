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
        Schema::create('saved_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // SaaS user
            $table->foreignId('facebook_page_id')->nullable()->constrained()->onDelete('cascade');

            $table->string('title');
            $table->text('content')->nullable();

            $table->enum('type', ['text', 'image', 'voice'])->default('text');
            $table->json('meta')->nullable(); // image url, voice url

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_replies');
    }
};
