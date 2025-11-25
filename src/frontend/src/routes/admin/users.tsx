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
import { ArrowDown, ArrowUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { callables } from "@/helpers/firebaseConfig";
import { UserRecord } from "firebase-admin/auth";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.auth.isAdmin()) {
      throw redirect({ to: "/" });
    }
  },
});

interface UserWithRole {
  uid: string;
  email?: string;
  displayName?: string;
  metadata: UserRecord["metadata"];
  customClaims?: Record<string, unknown>;
  isAdmin: boolean;
}

const columns: ColumnDef<UserWithRole>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      const isSortedAscending = column.getIsSorted() === "asc";
      return (
        <button
          onClick={() => column.toggleSorting(isSortedAscending)}
          className="flex items-center"
        >
          Email
          {isSortedAscending ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "uid",
    header: () => <div className="font-bold">User ID</div>,
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.getValue("uid")}</div>
    ),
  },
  {
    accessorKey: "metadata",
    header: ({ column }) => {
      const isSortedAscending = column.getIsSorted() === "asc";
      return (
        <button
          onClick={() => column.toggleSorting(isSortedAscending)}
          className="flex items-center"
        >
          Registration Date
          {isSortedAscending ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const metadata = row.getValue("metadata") as UserRecord["metadata"];
      const date = new Date(metadata.creationTime);
      return <div>{date.toLocaleDateString()}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const metadataA = rowA.getValue("metadata") as UserRecord["metadata"];
      const metadataB = rowB.getValue("metadata") as UserRecord["metadata"];
      return (
        new Date(metadataA.creationTime).getTime() -
        new Date(metadataB.creationTime).getTime()
      );
    },
  },
  {
    accessorKey: "isAdmin",
    header: () => <div className="text-center">Admin</div>,
    cell: ({ row }) => {
      const isAdmin = row.getValue("isAdmin") as boolean;
      const uid = row.getValue("uid") as string;

      return (
        <div className="flex justify-center">
          <AdminCheckbox uid={uid} initialIsAdmin={isAdmin} />
        </div>
      );
    },
  },
];

function AdminCheckbox({
  uid,
  initialIsAdmin,
}: {
  uid: string;
  initialIsAdmin: boolean;
}) {
  const [isAdmin, setIsAdmin] = React.useState(initialIsAdmin);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCheckboxChange = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await callables.setUserRole({
        userId: uid,
        role: checked ? "admin" : "",
      });
      setIsAdmin(checked);
    } catch (error) {
      console.error("Failed to update user role:", error);
      // Revert on error
      setIsAdmin(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Checkbox
      checked={isAdmin}
      onCheckedChange={handleCheckboxChange}
      disabled={isLoading}
    />
  );
}

function RouteComponent() {
  return <InnerComponent />;
}

function InnerComponent() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  React.useState<VisibilityState>({});
  const [users, setUsers] = React.useState<UserWithRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await callables.getAllUsers();
        const usersData = result.data as UserRecord[];
        const usersWithRole: UserWithRole[] = usersData.map((user) => ({
          ...user,
          isAdmin: user.customClaims?.role === "admin",
        }));
        setUsers(usersWithRole);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const table = useReactTable({
    data: users,
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
    return <div>Loading users...</div>;
  }

  return (
    <div className="mx-auto min-w-120 max-w-300 w-200">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-3xs"
        />
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getRowCount()} user{table.getRowCount() !== 1 ? "s" : ""}{" "}
          registered
        </div>
      </div>
    </div>
  );
}
