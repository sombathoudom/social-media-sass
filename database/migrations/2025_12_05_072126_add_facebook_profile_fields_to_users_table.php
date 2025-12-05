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
        Schema::table('users', function (Blueprint $table) {
            $table->string('facebook_name')->nullable()->after('facebook_token');
            $table->string('facebook_email')->nullable()->after('facebook_name');
            $table->string('facebook_avatar')->nullable()->after('facebook_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['facebook_name', 'facebook_email', 'facebook_avatar']);
        });
    }
};
