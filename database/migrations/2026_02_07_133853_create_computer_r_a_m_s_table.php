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
        Schema::create('computer_rams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('glpi_id')->unique();          // id Item_Disk
            $table->unsignedBigInteger('computer_id')->index();
            $table->string('ram_name');
            $table->string('frequence');
            $table->unsignedInteger('size');
            $table->string('serial')->nullable();
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
        Schema::dropIfExists('computer_rams');
    }
};
