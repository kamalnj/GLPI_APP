<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComputerRAM extends Model
{
    protected $table = 'computer_rams';

    protected $fillable = [
        'glpi_id',
        'computer_id',
        'ram_name',
        'size',
        'serial',
        'date_mod',
        'synced_at',
        'ram_total',
        'ram_free',
        'ram_usage',
        'ram_synced_at',
        'ram_alert_level',
    ];

    public function computer(): BelongsTo
    {
        return $this->belongsTo(Computer::class, 'computer_id');
    }
}
