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
        Schema::create('facebook_users', function (Blueprint $table) {
            $table->id();
            $table->string('facebook_id')->unique();
            $table->string('name')->nullable();
            $table->string('avatar')->nullable();
            $table->string('gender')->nullable();
            $table->string('locale')->nullable();

            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_users');
    }
};
