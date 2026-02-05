import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Computer } from "@/features/inventaire/types"

type Props = {
  computers: Computer[]
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return value.replace("T", " ").slice(0, 16)
}

export default function InventaireTable({ computers }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Nom</TableHead>
            <TableHead className="w-[35%]">Contact</TableHead>
            <TableHead className="w-[30%]">Dernière MAJ Inventaire</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {computers.map((computer) => (
            <TableRow key={computer.id}>
              <TableCell className="font-medium">
                {computer.name ?? "—"}
              </TableCell>
              <TableCell>{computer.contact ?? "—"}</TableCell>
              <TableCell>{formatDate(computer.last_inventory_update)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
