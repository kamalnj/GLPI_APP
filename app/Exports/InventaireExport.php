<?php

namespace App\Exports;

use App\Models\Computer;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class InventaireExport implements
    FromQuery,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle
{
    public function __construct() {}

    public function query()
    {
        return Computer::where('last_inventory_update', '<', now()->subDays(7))
            ->orderBy('synced_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'Machine',
            'Dernière MAJ de l\'inventaire',
            'Dernière synchronisation',
        ];
    }

    public function map($computer): array
    {
        return [
            $computer->name ?? 'N/A',
            $computer->last_inventory_update
                ? $computer->last_inventory_update->format('Y-m-d H:i:s')
                : 'N/A',
            $computer->synced_at
                ? $computer->synced_at->format('Y-m-d H:i:s')
                : 'N/A',
          
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // HEADER
        $sheet->getStyle('A1:D1')->applyFromArray([
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

        // BORDER
        $sheet->getStyle("A1:D{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // ZEBRA STRIPING
        for ($row = 2; $row <= $highestRow; $row++) {

            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:D{$row}")->applyFromArray([
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
            'B' => 25,
            'C' => 22,
            'D' => 22,
        ];
    }

    public function title(): string
    {
        return 'Patches Sécurité';
    }
}