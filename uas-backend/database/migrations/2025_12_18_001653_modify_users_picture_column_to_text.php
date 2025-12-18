<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Change picture column from VARCHAR(255) to TEXT to support larger base64 images
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
            // Revert to VARCHAR(255)
            $table->string('picture', 255)->nullable()->change();
        });
    }
};
