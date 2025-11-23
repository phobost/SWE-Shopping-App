import { createFileRoute, redirect } from "@tanstack/react-router";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Discount } from "@shared/types/discount";
import { deleteDiscount } from "@/helpers/discount/util";
import { DiscountDrawer } from "@/components/createDiscount";
import { useDiscounts } from "@/helpers/discount/context";

export const Route = createFileRoute("/admin/discounts")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.auth.isAdmin()) {
      throw redirect({ to: "/" });
    }
  },
});

const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: "code",
    header: () => <div className="font-bold">Code</div>,
    cell: ({ row }) => <div>{row.getValue("code")}</div>,
  },
  {
    accessorKey: "percentage",
    header: ({ column }) => {
      const isSortedAscending = column.getIsSorted() === "asc";
      return (
        <button
          onClick={() => column.toggleSorting(isSortedAscending)}
          className="flex items-center"
        >
          Percentage
          {isSortedAscending ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const percentage = parseFloat(row.getValue("percentage"));

      return <div>{percentage}%</div>;
    },
  },
  {
    accessorKey: "delete",
    header: "",
    cell: ({ row }) => {
      // row.
      const code: string = row.getValue("code");

      return (
        <Button variant="destructive" size="icon" className="hover:bg-red-900">
          <Trash
            onClick={async () => {
              console.log(`Deleting code with discount: ${code}`);
              await deleteDiscount(code);
            }}
          />
        </Button>
      );
    },
  },
];

function RouteComponent() {
  return <InnerComponent />;
}

function InnerComponent() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  React.useState<VisibilityState>({});

  const { data, loading } = useDiscounts();

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
  });

  if (loading) {
    return <div>Loading discounts...</div>;
  }

  return (
    <div className="mx-auto min-w-120 max-w-300 w-200">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter codes..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("code")?.setFilterValue(event.target.value)
          }
          className="max-w-3xs "
        />
        <div className="ml-auto">
          <DiscountDrawer />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getRowCount()} discounts available
        </div>
      </div>
    </div>
  );
}
