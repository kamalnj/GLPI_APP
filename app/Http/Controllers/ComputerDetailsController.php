<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventaire\ShowComputerRequest;
use App\Models\Computer;
use App\Services\Inventaire\ComputerDetailsService;
use Inertia\Inertia;
use Inertia\Response;

class ComputerDetailsController extends Controller
{
    public function show(
        Computer $computer,
        ComputerDetailsService $service
    ): Response {
        $computer = $service->getDetails($computer);

        return Inertia::render('Inventaire/Details', [
            'computer' => $computer,
        ]);
    }
}
