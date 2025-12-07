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
        // Add index for faster user page queries
        try {
            Schema::table('facebook_pages', function (Blueprint $table) {
                $table->index('user_id', 'idx_facebook_pages_user_id');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore error
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facebook_pages', function (Blueprint $table) {
            $table->dropIndex('idx_facebook_pages_user_id');
        });
    }
};
