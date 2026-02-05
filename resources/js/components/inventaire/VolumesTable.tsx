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

function num(v: number | null) {
  return v === null || Number.isNaN(v) ? "—" : v
}

export default function VolumesTable({ volumes }: { volumes: Volume[] }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left">Mount</th>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Free %</th>
            <th className="px-3 py-2 text-left">Free</th>
            <th className="px-3 py-2 text-left">Total</th>
            <th className="px-3 py-2 text-left">Encryption</th>
          </tr>
        </thead>
        <tbody>
          {volumes.map((v) => (
            <tr key={v.id} className="border-b last:border-b-0">
              <td className="px-3 py-2">{v.mountpoint ?? "—"}</td>
              <td className="px-3 py-2">{v.name ?? "—"}</td>
              <td className="px-3 py-2">{num(v.free_percent)}</td>
              <td className="px-3 py-2">{num(v.free_size)}</td>
              <td className="px-3 py-2">{num(v.total_size)}</td>
              <td className="px-3 py-2">{v.encryption_tool ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
