<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Change picture column from TEXT to LONGTEXT to support very large base64 images
     * TEXT can only hold ~64KB, but base64-encoded images need much more space
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Use longText to support very large base64-encoded images (up to 4GB)
            $table->longText('picture')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert to TEXT (or VARCHAR(255) if rolling back further)
            $table->text('picture')->nullable()->change();
        });
    }
};
