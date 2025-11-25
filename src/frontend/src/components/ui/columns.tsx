"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "./button.tsx";
import { CartProduct } from "@shared/types/cart.ts";
import { USD } from "@/lib/utils.ts";

export const columns: ColumnDef<CartProduct>[] = [
  {
    accessorKey: "cartQuantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          // Clean up button styling in header
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-left">{row.original.cartQuantity}</div>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left">Product</div>,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <div className="flex justify-end">
          {" "}
          {/* Ensures the button is right-aligned in the header */}
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const originalPrice = row.original.price * row.original.cartQuantity;
      const salePrice =
        row.original.cartQuantity *
        (row.original.price -
          row.original.price * (row.original.salePercentage * 0.01));
      const onSale = salePrice != originalPrice;
      return (
        <div className="text-right">
          {onSale ? (
            <div className="line-through">{USD.fromNumber(originalPrice)}</div>
          ) : (
            ""
          )}
          <div className={onSale ? "text-green-600 font-bold" : ""}>
            {USD.fromNumber(salePrice)}
          </div>
        </div>
      );
    },
  },
];
