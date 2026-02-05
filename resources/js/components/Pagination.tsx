import { Link } from "@inertiajs/react"
import type { PaginationLink } from "@/types/pagination"

type Props = {
  links: PaginationLink[]
}

export default function Pagination({ links }: Props) {
  if (!links || links.length <= 3) return null

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((link, idx) => (
        <Link
          key={`${link.label}-${idx}`}
          href={link.url ?? "#"}
          preserveScroll
          className={[
            "rounded-md border px-3 py-1 text-sm",
            link.active ? "bg-muted font-medium" : "bg-background",
            !link.url ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </nav>
  )
}
