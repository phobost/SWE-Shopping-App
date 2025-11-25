import { Order, OrderProduct, OrderStatus } from "@shared/types/order";
import { Eye, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as React from "react";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortDirection,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { USD } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { setOrder, UserOrder } from "@/helpers/orders/util";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { getSalePrice } from "@/helpers/product/util";

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return "bg-slate-400 dark:bg-slate-500";
    case OrderStatus.InProgress:
      return "bg-cyan-400 dark:bg-cyan-900";
    case OrderStatus.Shipped:
      return "bg-yellow-400 dark:bg-yellow-900";
    case OrderStatus.Completed:
      return "bg-emerald-400 dark:bg-emerald-900";
    case OrderStatus.Cancelled:
      return "bg-red-400 dark:bg-red-900";

    default:
      return "";
  }
};

function OrderProductsTable({ order }: { order: Order }) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Product</TableHead>
            <TableHead>Cost per Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.products.map((product) => {
            const salePrice = getSalePrice(product);
            const onSale = salePrice != product.price;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="flex flex-row gap-2">
                  {
                    <>
                      <div
                        className={onSale ? "line-through text-red-600" : ""}
                      >
                        {USD.fromNumber(product.price)}
                      </div>
                      {onSale ? (
                        <div className="font-bold text-green-300 dark:text-green-800">
                          {USD.fromNumber(salePrice)}
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  }
                </TableCell>
                <TableCell>{product.quantityOrdered}</TableCell>
                <TableCell className="text-right">
                  {USD.fromNumber(salePrice * product.quantityOrdered)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="">
            <TableCell colSpan={3}>Subtotal</TableCell>
            <TableCell className="text-right">
              {USD.fromNumber(order.subtotal)}
            </TableCell>
          </TableRow>

          <TableRow className="">
            <TableCell colSpan={3}>Tax</TableCell>
            <TableCell className="text-right">
              {USD.fromNumber(order.tax)}
            </TableCell>
          </TableRow>

          {order.discount ? (
            <TableRow>
              <TableCell colSpan={3}>Discount</TableCell>
              <TableCell className="text-right text-green-600">
                ({order.discount.percentage.toFixed(0)}%) -
                {USD.fromNumber(order.discount.percentage * 0.01 * order.total)}
              </TableCell>
            </TableRow>
          ) : (
            <></>
          )}

          <TableRow className="bg-sky-200 dark:bg-sky-900">
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              {USD.fromNumber(order.total)}
            </TableCell>
          </TableRow>
        </TableFooter>
        <TableCaption>
          Ordered: {order.timestamp.toDate().toLocaleString()}
        </TableCaption>
      </Table>
    </div>
  );
}

export function OrderDetail({ order }: { order: Order }) {
  return (
    <div>
      <div>
        <div className="text-xl flex flex-row gap-2">
          Order:
          <div className="font-bold"> {order.id}</div>
        </div>
        <div>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
      </div>
      <OrderProductsTable order={order} />
    </div>
  );
}

const SortArrow = ({ sort }: { sort: false | SortDirection }) => {
  switch (sort) {
    case "asc":
      return <ArrowUp className="ml-2 h-4 w-4" />;
    case "desc":
      return <ArrowDown className="ml-2 h-4 w-4" />;
    default:
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }
};

const SortableHeader = ({
  column,
  children,
}: {
  column: Column<UserOrder, unknown>;
  children: React.ReactNode;
}) => {
  const isSortedAscending = column.getIsSorted() === "asc";

  return (
    <button
      onClick={() => column.toggleSorting(isSortedAscending)}
      className="flex items-center font-bold"
    >
      {children}
      <SortArrow sort={column.getIsSorted()} />
    </button>
  );
};

export function Orders({
  orders: _orders,
  isAdmin,
}: {
  orders: UserOrder[];
  isAdmin?: boolean;
}) {
  isAdmin = isAdmin || false;
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [orders, setOrders] = React.useState(_orders);

  const [newFilters, setNewFilters] = React.useState<OrderStatus[]>([]);

  const columns: ColumnDef<UserOrder>[] = [
    {
      accessorKey: "id",
      header: "",
      cell: ({ row }) => {
        const order = row.original;

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Eye />
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-9/10">
              <OrderDetail order={order} />
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <SortableHeader column={column}>Order Date</SortableHeader>
      ),
      cell: ({ row }) => {
        const timestamp: Timestamp = row.getValue("timestamp");
        return <div>{timestamp.toDate().toLocaleString()}</div>;
      },
    },
    {
      accessorKey: "id",
      header: () => <div className="font-bold">Order ID</div>,
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "userIdentifier",
      header: ({ column }) => (
        <SortableHeader column={column}>Customer</SortableHeader>
      ),
      cell: ({ row }) => <div>{row.getValue("userIdentifier")}</div>,
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader column={column}>Total</SortableHeader>
      ),
      cell: ({ row }) => {
        const total = USD.fromNumber(row.getValue("total"));

        return <div>{total}</div>;
      },
    },
    {
      accessorKey: "products",
      header: ({ column }) => (
        <SortableHeader column={column}># Products</SortableHeader>
      ),
      cell: ({ row }) => {
        const products: OrderProduct[] = row.getValue("products");

        return <>{products.length}</>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ row }) => {
        const status: OrderStatus = row.getValue("status");

        return (
          <Popover>
            <PopoverTrigger
              asChild
              className={!isAdmin ? "pointer-events-none" : ""}
            >
              <Button
                variant="outline"
                className={`min-w-full w-30 ${getStatusColor(status)}`}
              >
                {status}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2 flex flex-col">
                {Object.values(OrderStatus).map((orderStatus) => {
                  return (
                    <Button
                      key={`${row.original.id}-${orderStatus}`}
                      variant="secondary"
                      className={`w-full ${getStatusColor(orderStatus)}`}
                      onClick={async () => {
                        const idx = orders.indexOf(row.original);
                        const val = row.original;
                        val.status = orderStatus;
                        orders.splice(idx, 1);
                        const { userIdentifier, ...order } = val;
                        const updatedOrder = await setOrder(order);
                        setOrders([
                          ...orders,
                          { ...updatedOrder, userIdentifier },
                        ]);
                      }}
                    >
                      {orderStatus}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      },
      filterFn: (row) => {
        const val: OrderStatus = row.getValue("status");
        return newFilters.length == 0 || newFilters.includes(val);
      },
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        {
          id: "timestamp",
          desc: true,
        },
      ],
    },
    state: {
      sorting,
    },
  });

  return (
    <div className="mx-auto min-w-120 w-19/20 max-w-600 ">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="Filter orders by id..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-3xs "
        />
        <Input
          placeholder="Filter orders by customer..."
          value={
            (table.getColumn("userIdentifier")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("userIdentifier")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              Filter by Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-semibold">Filter Options</h4>
              <div className="space-y-3">
                {Object.values(OrderStatus).map((orderStatus) => (
                  <div key={orderStatus} className="flex items-center gap-2">
                    <Checkbox
                      checked={newFilters.includes(orderStatus)}
                      onCheckedChange={(checked) => {
                        const isChecked = typeof checked === "boolean";
                        if (isChecked && !newFilters.includes(orderStatus)) {
                          setNewFilters([...newFilters, orderStatus]);
                        } else {
                          setNewFilters(
                            newFilters.filter((s) => s !== orderStatus),
                          );
                        }

                        table.getColumn("status")?.setFilterValue(newFilters);
                      }}
                    />
                    <Label className="cursor-pointer">{orderStatus}</Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
          {table.getRowCount()} orders
        </div>
      </div>
    </div>
  );
}
