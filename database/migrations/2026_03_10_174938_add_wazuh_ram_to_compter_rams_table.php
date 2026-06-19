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
  if (!Schema::hasColumn('computer_rams', 'ram_total')) {
            $table->bigInteger('ram_total')->nullable();
        }
    if (!Schema::hasColumn('computer_rams', 'ram_free')) {
            $table->bigInteger('ram_free')->nullable();
        }
    if (!Schema::hasColumn('computer_rams', 'ram_usage')) {
            $table->integer('ram_usage')->nullable();
        }
    if (!Schema::hasColumn('computer_rams', 'ram_synced_at')) {
            $table->timestamp('ram_synced_at')->nullable();
        }
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
