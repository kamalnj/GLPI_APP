<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agents extends Model
{
    protected $fillable = [
        'wazuh_agent_id',
        'name',
        'ip',
        'os',
        'synced_at',
    ];

    public function vulnerabilities()
    {
        return $this->belongsToMany(Vulnerabilite::class, 'agent_vulnerabilities', 'agent_id', 'vulnerability_id')
            ->withPivot('package', 'package_version', 'detected_at')
            ->withTimestamps();
    }

    public function computer()
    {
        return $this->hasOne(
            Computer::class,
            'wazuh_agent_id',
            'wazuh_agent_id'
        );
    }
}
