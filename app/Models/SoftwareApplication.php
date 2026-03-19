<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SoftwareApplication extends Model
{
    protected $table = 'computer_software_application';

    protected $fillable = [
        'glpi_item_softwareversion_id',
        'glpi_softwareversion_id',
        'glpi_software_id',
        'computer_id',
        'software_name',
        'version',
        'date_install',
        'date_mod',
        'synced_at',
    ];

    public function computer()
    {
        return $this->belongsTo(Computer::class);
    }
    
}