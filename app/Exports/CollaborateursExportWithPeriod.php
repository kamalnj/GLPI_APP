<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CollaborateursExportWithPeriod implements
    FromQuery,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle
{
    protected ?string $fromDate;
    protected ?string $toDate;
    protected ?string $search;
    protected ?int $machinesMin;
    protected ?int $machinesMax;

    public function __construct(?string $fromDate = null, ?string $toDate = null, ?string $search = null, ?int $machinesMin = null, ?int $machinesMax = null)
    {
        $this->fromDate = $fromDate;
        $this->toDate = $toDate ?? $fromDate;
        $this->search = $search;
        $this->machinesMin = $machinesMin;
        $this->machinesMax = $machinesMax;
    }

   public function query()
{
    $query = DB::connection('sqlsrv')
        ->table('vw_user_daily_activity')
        ->select(
            'user_name',
            DB::raw('MIN(date) as date'), 
            DB::raw('MAX(machines_count) as machines_count'),
            DB::raw('SUM(active_seconds) as active_seconds'),
            DB::raw('SUM(unlock_count) as unlock_count')
        )
        ->groupBy('user_name');

    if ($this->search) {
        $query->where('user_name', 'like', '%' . $this->search . '%');
    }

    if ($this->machinesMin !== null) {
        $query->havingRaw('SUM(machines_count) >= ?', [$this->machinesMin]);
    }

    if ($this->machinesMax !== null) {
        $query->havingRaw('SUM(machines_count) <= ?', [$this->machinesMax]);
    }

    if ($this->fromDate && $this->toDate) {
        $query->whereBetween('date', [
            $this->fromDate,
            $this->toDate,
        ]);
    }

    return $query->orderByDesc('active_seconds');
}

    public function headings(): array
    {
        return [
            'Utilisateur',
            'Date',
            'Machines',
            'Temps Actif (h)',
            'Unlocks',
        ];
    }

    public function map($row): array
    {
        return [
            $row->user_name ?? 'N/A',
            $row->date ?? 'N/A',
            $row->machines_count ?? 'N/A',
            $row->active_seconds ? round($row->active_seconds / 3600, 2) : 'N/A',
            $row->unlock_count ?? 'N/A',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // HEADER
        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2563EB'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // BODY
        $sheet->getStyle("A2:E{$highestRow}")->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 15,
            'C' => 12,
            'D' => 18,
            'E' => 12,
        ];
    }

    public function title(): string
    {
        return 'Collaborateurs';
    }
}
