<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComputerAntivirus extends Model
{
    protected $table = 'computer_antiviruses';

    protected $fillable = [
        'glpi_id',
        'computer_id',
        'name',
        'antivirus_version',
        'date_mod',
        'synced_at',
    ];

    public function computer(): BelongsTo
    {
        return $this->belongsTo(Computer::class, 'computer_id');
    }
}
