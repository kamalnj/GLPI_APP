<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    ];
}
