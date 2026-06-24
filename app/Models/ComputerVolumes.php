<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComputerVolumes extends Model
{
    protected $table = 'computer_volumes';

    protected $casts = [
        'synced_at' => 'datetime',
    ];

    protected $fillable = [
        'glpi_id',
        'computer_id',
        'mountpoint',
        'name',
        'total_size',
        'free_size',
        'free_percent',
        'encryption_tool',
        'date_mod',
        'synced_at',
        'alert_level',
    ];

    public function computer(): BelongsTo
    {
        return $this->belongsTo(Computer::class, 'computer_id');
    }
}
