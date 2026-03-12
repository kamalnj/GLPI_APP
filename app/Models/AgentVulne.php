<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgentVulne extends Model
{           protected $table = 'agent_vulnerabilities';

    protected $fillable = [
        'agent_id',
        'vulnerability_id',
        'package',
        'package_version',
        'detected_at',
    ];

        public function agent()
        {
            return $this->belongsTo(Agents::class, 'agent_id', 'id');
        }
        public function vulnerability()
        {
            return $this->belongsTo(Vulnerabilite::class, 'vulnerability_id', 'id');
        }
}
