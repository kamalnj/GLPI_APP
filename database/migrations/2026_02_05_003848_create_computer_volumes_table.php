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
        Schema::create('computer_volumes', function (Blueprint $table) {
            $table->id();

            // Liens
            $table->unsignedBigInteger('glpi_id')->unique();          // id Item_Disk
            $table->unsignedBigInteger('computer_id')->index();  // FK

            // Volume
            $table->string('mountpoint');        // C:, D:, …
            $table->string('name')->nullable();  // C:, Réservé au système

            // Tailles (unités GLPI)
            $table->bigInteger('total_size');    // totalsize
            $table->bigInteger('free_size');     // freesize
            $table->unsignedTinyInteger('free_percent'); // calculé

            // Sécurité
            $table->string('encryption_tool')->nullable(); // BitLocker

            // Sync
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
        Schema::dropIfExists('computer_volumes');
    }
};
