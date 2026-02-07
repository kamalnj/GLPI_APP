<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerCPU extends Model
{
    
    protected $table = 'computer_cpus';

    protected $fillable = [
        'glpi_id',
        'computer_id',
        'cpu_name',
        'frequence',
        'nbr_cores',
        'nbr_threads',
        'date_mod',
        'synced_at',
        'cpu_tier',
    ];
}
