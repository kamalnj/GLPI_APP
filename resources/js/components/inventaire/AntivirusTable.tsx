type Antivirus = {
  id: number
  name: string | null
  antivirus_version: string | null
  date_mod: string | null
}

export default function AntivirusTable({ antiviruses }: { antiviruses: Antivirus[] }) {
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Version</th>
            <th className="px-3 py-2 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {antiviruses.map((av) => (
            <tr key={av.id} className="border-b last:border-b-0">
              <td className="px-3 py-2">{av.name ?? "—"}</td>
              <td className="px-3 py-2">{av.antivirus_version ?? "—"}</td>
              <td className="px-3 py-2">{av.date_mod ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
