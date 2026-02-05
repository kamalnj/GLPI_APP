<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('computers', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('glpi_id')->unique();

            $table->string('name')->nullable();
            $table->string('contact')->nullable();
            // GLPI date_mod
            $table->dateTime('last_inventory_update')->nullable();

            $table->dateTime('synced_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('computers');
    }
};
