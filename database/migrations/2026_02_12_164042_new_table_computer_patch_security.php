<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('computer_patch_securite', function (Blueprint $table) {
            $table->id();

            // Unique: this is the "installation row" in GLPI (Item_SoftwareVersion.id)
            $table->unsignedBigInteger('glpi_item_softwareversion_id')->unique();

            // NOT unique: same softwareversion/software can exist on many computers
            $table->unsignedBigInteger('glpi_softwareversion_id')->index();
            $table->unsignedBigInteger('glpi_software_id')->index();

            // Local FK
            $table->unsignedBigInteger('computer_id')->index();

            $table->string('patch_name');
            $table->dateTime('date_install')->nullable();
            $table->dateTime('date_mod')->nullable();
            $table->timestamp('synced_at')->nullable();

            $table->timestamps();

            // Optional (recommended): prevent duplicates per computer/version
            // $table->unique(['computer_id', 'glpi_softwareversion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('computer_patch_securite');
    }
};
