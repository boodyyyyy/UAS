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
        Schema::create('department_budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->string('fiscal_year');
            $table->decimal('total_budget', 12, 2);
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->decimal('remaining_balance', 12, 2);
            $table->decimal('variance', 12, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['department_id', 'fiscal_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('department_budgets');
    }
};

