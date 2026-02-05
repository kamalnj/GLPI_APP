import { Head, router } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import type { BreadcrumbItem } from "@/types"
import type { Paginated } from "@/types/pagination"
import type { Computer } from "@/features/inventaire/types"
import { useState } from "react"
import InventaireTable from "@/components/TableInventaire"
import Pagination from "@/components/Pagination"


type PageProps = {
  computers: Paginated<Computer>
  filters: {
    search: string | null
    missing_sophos: boolean | null
    perPage: number
  }
}

const breadcrumbs: BreadcrumbItem[] = [{ title: "Inventaire", href: "/inventaire" }]

export default function Index({ computers, filters }: PageProps) {
  const [search, setSearch] = useState(filters.search ?? "")
  const [missingSophos, setMissingSophos] = useState(!!filters.missing_sophos)
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setLoading(true)

    router.get(
      "/inventaire",
      {
        search: search.trim() || null,
        missing_sophos: missingSophos ? 1 : 0,
        perPage: filters.perPage,
      },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
        onFinish: () => setLoading(false),
      }
    )
  }

  const reset = () => {
    setSearch("")
    setMissingSophos(false)
    setLoading(true)

    router.get(
      "/inventaire",
      { search: null, missing_sophos: null, perPage: filters.perPage },
      {
        preserveScroll: true,
        preserveState: true,
        replace: true,
        onFinish: () => setLoading(false),
      }
    )
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inventaire" />

      <div className="flex flex-col gap-4 rounded-xl p-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-3 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Recherche</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, contact..."
                className="h-10 rounded-md border px-3 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
           <label className="flex items-center gap-2 text-sm">
            <input
                type="checkbox"
                checked={missingSophos}
                onChange={(e) => setMissingSophos(e.target.checked)}
            />
            Sans Sophos Intercept X
            </label>

            </div>

            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={loading}
                className="h-10 rounded-md border px-4 text-sm font-medium disabled:opacity-60"
              >
                {loading ? "..." : "Appliquer"}
              </button>
              <button
                onClick={reset}
                disabled={loading}
                className="h-10 rounded-md border px-4 text-sm disabled:opacity-60"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">{computers.total} élément(s)</div>
        </div>

        {/* Content */}
        {computers.data.length === 0 ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            Aucun ordinateur trouvé.
          </div>
        ) : (
          <>
            <InventaireTable computers={computers.data} />
            <Pagination links={computers.links} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
