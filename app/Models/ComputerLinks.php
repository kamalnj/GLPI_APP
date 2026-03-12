<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerLinks extends Model
{
    protected $fillable = [
        'agent_id',
        'computer_id',
    ];
}
