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
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use App\Models\AgentVulne;

class VulneExport implements
    FromQuery,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnWidths,
    WithTitle
{
    protected $wazuhAgentId;
    protected $computerName;

    public function __construct($wazuhAgentId, $computerName = null)
    {
        $this->wazuhAgentId = $wazuhAgentId;
        $this->computerName = $computerName;
    }

    /**
     * Query TOUTES les vulnérabilités via wazuh_agent_id
     */
    public function query()
    {
        return AgentVulne::query()
            ->with('vulnerability') // Eager load
            ->where('agent_id', $this->wazuhAgentId) // agent_id = wazuh_agent_id
            ->orderBy('detected_at', 'desc');
    }

    public function headings(): array
    {
        return [
            'ID',
            'CVE',
            'Sévérité',
            'Score CVSS',
            'Package',
            'Version',
            'Description',
            'Détecté le',
        ];
    }

    public function map($agentVulne): array
    {
        $vulnerability = $agentVulne->vulnerability;

        $detectedAt = $agentVulne->detected_at
            ? \Carbon\Carbon::parse($agentVulne->detected_at)
            : null;

    

        return [
            $vulnerability->id ?? '—',
            $vulnerability->cve ?? '—',
            strtoupper($vulnerability->severity ?? 'UNKNOWN'),
            $vulnerability->score ?? '—',
            $agentVulne->package ?? '—',
            $agentVulne->package_version ?? '—',
            $vulnerability->description ?? '—',
            $detectedAt ? $detectedAt->format('d/m/Y H:i') : '—',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // Header style
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '2563EB'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '1E40AF'],
                ],
            ],
        ]);

        // Borders for all cells
        $sheet->getStyle("A1:I{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E7EB'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Center align
        $sheet->getStyle("A2:A{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("B2:B{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("C2:C{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("D2:D{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("H2:H{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("I2:I{$highestRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Apply colors
        for ($row = 2; $row <= $highestRow; $row++) {
            $severity = strtoupper($sheet->getCell("C{$row}")->getValue());

            $severityColors = [
                'CRITICAL' => ['bg' => 'FEE2E2', 'text' => '991B1B'],
                'HIGH' => ['bg' => 'FED7AA', 'text' => '9A3412'],
                'MEDIUM' => ['bg' => 'FEF3C7', 'text' => '92400E'],
                'LOW' => ['bg' => 'DBEAFE', 'text' => '1E40AF'],
                'UNKNOWN' => ['bg' => 'F3F4F6', 'text' => '6B7280'],
            ];

            if (isset($severityColors[$severity])) {
                $sheet->getStyle("C{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $severityColors[$severity]['bg']],
                    ],
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => $severityColors[$severity]['text']],
                    ],
                ]);
            }

  

            // Zebra striping
            if ($row % 2 == 0) {
                $sheet->getStyle("A{$row}:I{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F9FAFB'],
                    ],
                ]);
            }
        }

        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getStyle("G2:G{$highestRow}")->getAlignment()->setWrapText(true);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 18,
            'C' => 12,
            'D' => 12,
            'E' => 25,
            'F' => 15,
            'G' => 50,
            'H' => 18,
        ];
    }

    public function title(): string
    {
        return $this->computerName
            ? 'Vulnérabilités - ' . substr($this->computerName, 0, 20)
            : 'Vulnérabilités';
    }
}
