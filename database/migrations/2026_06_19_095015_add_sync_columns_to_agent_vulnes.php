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
        Schema::table('agent_vulnerabilities', function (Blueprint $table) {
            $table->boolean('active')->default(true);

            $table->timestamp('last_seen_at')->nullable();

            $table->timestamp('resolved_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_vulnes', function (Blueprint $table) {
            //
        });
    }
};
