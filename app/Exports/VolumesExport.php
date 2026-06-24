<?php

namespace App\Exports;

use App\Models\ComputerVolumes;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VolumesExport implements FromQuery, WithColumnWidths, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct() {}

    public function query()
    {
        return ComputerVolumes::with('computer')
            ->whereIn('alert_level', ['critical', 'alert'])
            ->orderBy('synced_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'Machine',
            'Partition',
            'Taille totale (GB)',
            'Espace libre (GB)',
            '% Libre',
            'Niveau d\'alerte',
            'Dernière synchronisation',
        ];
    }

    public function map($computerVolume): array
    {
        $total = (float) $computerVolume->total_size;
        $free = (float) $computerVolume->free_size;

        return [
            $computerVolume->computer?->name ?? 'N/A',
            $computerVolume->mountpoint ?? 'N/A',

            $total > 0 ? round($total / 1024, 2) : 0,
            $free > 0 ? round($free / 1024, 2) : 0,

            ($computerVolume->free_percent ?? 0).'%',
            strtoupper($computerVolume->alert_level ?? 'N/A'),

            $computerVolume->synced_at?->format('Y-m-d H:i:s') ?? 'N/A',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // HEADER STYLE
        $sheet->getStyle('A1:G1')->applyFromArray([
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

        // BORDERS
        $sheet->getStyle("A1:G{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // ALERT COLORS + ZEBRA
        for ($row = 2; $row <= $highestRow; $row++) {

            $severity = strtoupper($sheet->getCell("F{$row}")->getValue());

            $colors = [
                'CRITICAL' => ['bg' => 'FEE2E2', 'text' => '991B1B'],
                'ALERT' => ['bg' => 'FED7AA', 'text' => '9A3412'],
                'HIGH' => ['bg' => 'FED7AA', 'text' => '9A3412'],
                'MEDIUM' => ['bg' => 'FEF3C7', 'text' => '92400E'],
                'LOW' => ['bg' => 'DBEAFE', 'text' => '1E40AF'],
            ];

            if (isset($colors[$severity])) {
                $sheet->getStyle("F{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $colors[$severity]['bg']],
                    ],
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => $colors[$severity]['text']],
                    ],
                ]);
            }

            // Zebra striping
            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:G{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F9FAFB'],
                    ],
                ]);
            }
        }

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 15,
            'C' => 18,
            'D' => 18,
            'E' => 12,
            'F' => 15,
            'G' => 22,
        ];
    }

    public function title(): string
    {
        return 'Volumes Critiques';
    }
}
