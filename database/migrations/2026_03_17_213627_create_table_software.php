<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('computer_software_application', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('glpi_item_softwareversion_id')->unique();
            $table->unsignedBigInteger('glpi_softwareversion_id')->index();
            $table->unsignedBigInteger('glpi_software_id')->index();
            $table->unsignedBigInteger('computer_id');
            $table->string('software_name')->nullable();
            $table->string('version')->nullable();
            $table->date('date_install')->nullable();
            $table->timestamp('date_mod')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index('computer_id');
            $table->index('glpi_software_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('computer_software_application');
    }
};