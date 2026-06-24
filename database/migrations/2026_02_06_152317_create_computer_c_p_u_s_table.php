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
        Schema::create('computer_cpus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('glpi_id')->unique();          // id Item_Disk
            $table->unsignedBigInteger('computer_id')->index();
            $table->string('cpu_name');
            $table->string('frequence');
            $table->unsignedInteger('nbr_cores');
            $table->unsignedInteger('nbr_threads');
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
        Schema::dropIfExists('computer_cpus');
    }
};
