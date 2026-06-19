<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerOS extends Model
{
    protected $table = 'computer_os';

    protected $fillable = [
        'glpi_id',
        'computer_id',
        'os_name',
        'os_version_name',
        'os_arch_name',
        'install_date',
        'date_mod',
        'synced_at',
    ];
}
