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
        Schema::create('computer_os', function (Blueprint $table) {
            $table->id();
            // Liens
            $table->unsignedBigInteger('glpi_id')->unique();          // id Item_Disk
            $table->unsignedBigInteger('computer_id')->index();  // FK

            $table->string('os_name');        // C:, D:, …
            $table->string('os_version_name')->nullable();
            $table->string('os_arch_name')->nullable();

            $table->dateTime('install_date')->nullable();
            $table->dateTime('date_mod')->nullable();
            $table->dateTime('synced_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('computer_os');
    }
};
