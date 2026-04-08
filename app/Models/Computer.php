<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Computer extends Model
{
    protected $fillable = [
        'wazuh_agent_id',
        'glpi_id',
        'name',
        'computer_model',
        'contact',
        'last_inventory_update',
        'synced_at',
        'groupe'
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

    public function agent()
{
    return $this->belongsTo(
        Agents::class,
        'wazuh_agent_id',
        'wazuh_agent_id'
    );
}
public function vulnerabilities()
{
    return $this->hasManyThrough(
        Vulnerabilite::class,      // Model final
        AgentVulne::class,         // Pivot table model
        'agent_id',                // Foreign key sur AgentVulne vers Agents
        'id',                      // Foreign key sur Vulnerabilite
        'wazuh_agent_id',          // Local key sur Computer
        'vulnerability_id'         // Local key sur AgentVulne vers Vulnerabilite
    );
}
 

     public function softwares(): HasMany
    {
        return $this->hasMany(SoftwareApplication::class, 'computer_id','id');          
    }
  
}
