import { Head, Link } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import AntivirusTable from "@/components/inventaire/AntivirusTable"
import VolumesTable from "@/components/inventaire/VolumesTable"


type Antivirus = {
  id: number
  name: string | null
  antivirus_version: string | null
  date_mod: string | null
}

type Volume = {
  id: number
  name: string | null
  mountpoint: string | null
  total_size: number | null
  free_size: number | null
  free_percent: number | null
  encryption_tool: string | null
  date_mod: string | null
}

type Computer = {
  id: number
  name: string | null
  contact: string | null
  last_inventory_update: string | null
  antiviruses: Antivirus[]
  volumes: Volume[]
}

type PageProps = {
  computer: Computer
}

export default function Details({ computer }: PageProps) {
  return (
    <AppLayout>
      <Head title={`Details - ${computer.name ?? "Computer"}`} />

      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{computer.name ?? "—"}</div>
            <div className="text-sm text-muted-foreground">
              Contact: {computer.contact ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">
              Last inventory update: {computer.last_inventory_update ?? "—"}
            </div>
          </div>

          <Link
            href="/inventaire"
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium"
          >
            Back
          </Link>
        </div>

          {/* Volumes */}
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Volumes</div>
            <div className="text-sm text-muted-foreground">{computer.volumes.length}</div>
          </div>

          {computer.volumes.length === 0 ? (
            <div className="text-sm text-muted-foreground">No volume data.</div>
          ) : (
            <VolumesTable volumes={computer.volumes} />
          )}
        </div>

        {/* Antivirus */}
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Antiviruses</div>
            <div className="text-sm text-muted-foreground">{computer.antiviruses.length}</div>
          </div>

          {computer.antiviruses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No antivirus data.</div>
          ) : (
            <AntivirusTable antiviruses={computer.antiviruses} />
          )}
        </div>

      
      </div>
    </AppLayout>
  )
}
