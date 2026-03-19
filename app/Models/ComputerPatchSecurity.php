<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerPatchSecurity extends Model
{
    
    protected $table = 'computer_patch_securite';
    protected $fillable = [
        'glpi_item_softwareversion_id',
        'glpi_softwareversion_id',
        'glpi_software_id',
        'computer_id',
        'patch_name',
        'date_install',
        'date_mod',
        'synced_at',
    ];
    public function computer()
    {
        return $this->belongsTo(Computer::class);
    }
}
