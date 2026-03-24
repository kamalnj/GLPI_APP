export type AlertLevel = 'alert' | 'critical';

export interface RamAlert {
    id: number;
    computer_id: number;
    computer_name: string;
    ram_name: string;
    ram_usage: number;
    alert_level: AlertLevel;
    synced_at: string;
}

export interface Partition {
    id: number;
    mountpoint: string;
    free_percent: number;
    alert_level: AlertLevel;
}

export interface DiskAlert {
    computer_id: number;
    computer_name: string;
    alert_level: AlertLevel;
    synced_at: string;
    partitions: Partition[];
}

export interface PatchWindowsAlert {
    id: number;
    computer_id: number;
    computer_name: string;
    patch_name: string;
    date_install: string;
    synced_at: string;
}

