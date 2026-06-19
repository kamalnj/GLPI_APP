<?php

namespace App\Http\Controllers;

use App\Services\Collabs\CollabsService;
use App\Services\Collabs\CollabDetails;
use App\Http\Requests\Collabs\ListCollaborateursRequest;
use App\Exports\CollaborateursExportWithPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class CollaborateursController extends Controller
{
    public function __construct(
        protected CollabsService $collabsService,
        protected CollabDetails $collabDetails
    ) {}

    public function index(ListCollaborateursRequest $request)
    {
        return Inertia::render('Collaborateurs/Index', [

            'users' => $this->collabsService->paginate(
                $request->search(),
                $request->machinesMin(),
                $request->machinesMax(),
                $request->fromDate(),
                $request->toDate(),
                $request->perPage()

            ),
            'filters' => [
                'search' => $request->query('search'),
                'machines_min' => $request->query('machines_min'),
                'machines_max' => $request->query('machines_max'),
                'from_date' => $request->query('from_date'),
                'to_date' => $request->query('to_date'),
            ]
        ]);
    }

    public function export(Request $request)
    {
        $fromDate = $request->query('from_date', null);
        $toDate = $request->query('to_date', null);
        $search = $request->query('search', null);

        // Valider les dates
        if (!$fromDate) {
            return redirect()->back()->withErrors(['error' => 'Veuillez sélectionner une date']);
        }

        $dateLabel = $toDate && $toDate !== $fromDate
            ? "Du {$fromDate} au {$toDate}"
            : $fromDate;

        $fileName = "Collaborateurs_{$dateLabel}_" . now()->format('His') . '.xlsx';

        return Excel::download(
            new CollaborateursExportWithPeriod($fromDate, $toDate, $search),
            $fileName
        );
    }

    public function show(Request $request, string $user)
    {
        $mode = $request->input('mode', 'current');

        return Inertia::render('Collaborateurs/Show', [
            ...$this->collabDetails->getUserDetails($user, $mode),
            'mode' => $mode
        ]);
    }
}
