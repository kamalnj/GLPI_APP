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
    Schema::table('computer_rams', function (Blueprint $table) {
    $table->bigInteger('ram_total')->nullable();
    $table->bigInteger('ram_free')->nullable();
    $table->integer('ram_usage')->nullable();
    $table->timestamp('ram_synced_at')->nullable();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('computers', function (Blueprint $table) {
            //
        });
    }
};
