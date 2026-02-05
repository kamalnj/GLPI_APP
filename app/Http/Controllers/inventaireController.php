<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventaire\ListComputersRequest;
use App\Services\Inventaire\ComputerInventoryService;
use Inertia\Inertia;
use Inertia\Response;


class inventaireController extends Controller
{
    public function index(ListComputersRequest $request, ComputerInventoryService $service): Response
    {
        
        $computers = $service->paginate(
            $request->search(),
            $request->missingSophos(),
            $request->perPage()
        );

        return Inertia::render('Inventaire/Index', [
            'computers' => $computers,
            'filters' => [
                'search' => $request->search(),
                'perPage' => $request->perPage(),
                'missing_sophos' => $request->missingSophos(),
            ],

        ]);
    }
}
