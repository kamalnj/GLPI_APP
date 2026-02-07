<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Computer extends Model
{
    protected $fillable = [
        'glpi_id',
        'name',
        'contact',
        'last_inventory_update',
        'synced_at',
    ];

      public function antiviruses(): HasMany
    {
        return $this->hasMany(ComputerAntivirus::class, 'computer_id','id');
    }
    public function volumes(): HasMany
    {
        return $this->hasMany(ComputerVolumes::class, 'computer_id','id');
    }
    public function cpu(): HasMany
    {
        return $this->hasMany(ComputerCPU::class, 'computer_id','id');
    }
    public function ram(): HasMany
    {
        return $this->hasMany(ComputerRAM::class, 'computer_id','id');          
    }
    public function os(): HasMany
    {
        return $this->hasMany(ComputerOS::class, 'computer_id','id');          
    }
}
