<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailySummary extends Model
{
    protected $table = 'daily_summary_central';
    protected $connection = 'sqlsrv';
    protected $primaryKey = 'id';
    protected $fillable = [
        'date',
        'machine_name',
        'user_name',
        'user_domain',
        'active_secondes',
        'unlock_count',
        'primary_ssid',
        'primary_ip'

    ];
}
