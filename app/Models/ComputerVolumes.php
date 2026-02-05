<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerVolumes extends Model
{
    protected $table = 'computer_volumes';
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
    ];
}
