<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vulnerabilite extends Model
{
    protected $table = 'vulnerabilities';

    protected $fillable = [
        'cve',
        'severity',
        'score',
        'description',
    ];
    public function agentVulnerabilities()
    {
        return $this->hasMany(AgentVulne::class, 'vulnerability_id', 'id');
    }
    public function agents()
    {
        return $this->belongsToMany(
            Agents::class,
            'agent_vulnerabilities',
            'vulnerability_id',
            'agent_id'
        );
    }
}
