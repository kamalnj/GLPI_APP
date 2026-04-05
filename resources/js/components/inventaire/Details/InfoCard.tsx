type Props = {
  title: string
  lines: (string | null | undefined)[]
}

export default function InfoCard({ title, lines }: Props) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 text-sm font-medium text-muted-foreground">
        {title}
      </div>

      <div className="space-y-1 text-sm">
        {lines.filter(Boolean).length === 0 ? (
          <div className="text-muted-foreground">—</div>
        ) : (
          lines.filter(Boolean).map((line, i) => (
            <div key={i}>{line}</div>
          ))
        )}
      </div>
    </div>
  )
}
