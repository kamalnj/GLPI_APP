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
        Schema::create('computer_antiviruses', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('glpi_id')->unique();
            $table->unsignedBigInteger('computer_id')->index();

            $table->string('name')->nullable();

            $table->string('antivirus_version')->nullable();

            $table->timestamp('date_mod')->nullable();
            $table->dateTime('synced_at')->nullable();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('computer_antiviruses');
    }
};
