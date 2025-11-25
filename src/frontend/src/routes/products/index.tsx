import { ProductCard, ProductPurchaseButtons } from "@/components/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/helpers/authContext";
import { useProducts } from "@/helpers/product/context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, PlusCircleIcon } from "lucide-react";
import React, { useState } from "react";

export const Route = createFileRoute("/products/")({
  component: RouteComponent,
});

enum SortOrder {
  Ascending,
  Descending,
}

const invertSortOrder = (sort: SortOrder | undefined): SortOrder => {
  if (sort == SortOrder.Descending) {
    return SortOrder.Ascending;
  }
  return SortOrder.Descending;
};

const SortArrow = ({ sort }: { sort: SortOrder | undefined }) => {
  switch (sort) {
    case SortOrder.Ascending:
      return <ArrowUp className="ml-2 h-4 w-4" />;
    case SortOrder.Descending:
      return <ArrowDown className="ml-2 h-4 w-4" />;
    default:
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }
};

function RouteComponent() {
  const context = useAuthContext();
  const isAdmin = context.isAdmin();
  const { data, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [searchByName, setSearchByName] = useState(true);

  const [sortPrice, setPriceSort] = React.useState<SortOrder | undefined>(
    undefined,
  );
  const [sortQuantity, setQuantitySort] = React.useState<SortOrder | undefined>(
    undefined,
  );

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  /*let filteredProducts = data.filter(
    (product) =>
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())) &&
      (product.isAvailable || isAdmin),
  );*/

  // OLD filter
  // let filteredProducts = data.filter(
  //   (product) =>
  //     (product.name.toLowerCase().includes(search.toLowerCase()) ||
  //      product.description.toLowerCase().includes(search.toLowerCase())) &&
  //     (product.isAvailable || isAdmin),
  // );

  // NEW filter using separate inputs
  /*let filteredProducts = data.filter((product) => product.isAvailable || isAdmin);

if (nameSearch) {
  filteredProducts = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(nameSearch.toLowerCase()),
  );
}

if (descSearch) {
  filteredProducts = filteredProducts.filter((product) =>
    product.description.toLowerCase().includes(descSearch.toLowerCase()),
  );
}*/

  let filteredProducts = data.filter(
    (product) => product.isAvailable || isAdmin,
  );

  if (search) {
    filteredProducts = filteredProducts.filter((product) =>
      searchByName
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : product.description.toLowerCase().includes(search.toLowerCase()),
    );
  }

  if (sortPrice !== undefined) {
    if (sortPrice === SortOrder.Ascending) {
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    } else {
      filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
    }
  }
  if (sortQuantity !== undefined) {
    if (sortQuantity === SortOrder.Ascending) {
      filteredProducts = filteredProducts.sort(
        (a, b) => a.quantityInStock - b.quantityInStock,
      );
    } else {
      filteredProducts = filteredProducts.sort(
        (a, b) => b.quantityInStock - a.quantityInStock,
      );
    }
  }

  console.log(filteredProducts.map((v) => v.price));

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold tracking-tight">Products</h1>

        <div className="max-w-md mx-auto mt-6 flex flex-col justify-center items-center gap-2">
          {/*<Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />*/}
          {/*<Input
            type="text"
            placeholder="Search by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Search by description..."
            value={descSearch}
            onChange={(e) => setDescSearch(e.target.value)}
          />*/}
          <Input
            type="text"
            placeholder={
              searchByName ? "Search by name..." : "Search by description..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Search mode slider */}
          <div className="relative w-52 h-10 bg-gray-200 rounded-full flex items-center cursor-pointer select-none mt-2">
            {/* Slider thumb */}
            <div
              className={`absolute top-1 left-1 w-24 h-8 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                !searchByName ? "translate-x-full" : ""
              }`}
            ></div>

            {/* Labels */}
            <div
              className="flex justify-between w-full px-2 text-sm font-medium text-gray-700 z-10"
              onClick={() => setSearchByName(!searchByName)}
            >
              <span
                className={`w-1/2 text-center ${
                  searchByName ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setSearchByName(true)}
              >
                Name
              </span>
              <span
                className={`w-1/2 text-center ${
                  !searchByName ? "text-black" : "text-gray-500"
                }`}
                onClick={() => setSearchByName(false)}
              >
                Desc
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-2 text-center">
            <Button
              className="w-50"
              variant="outline"
              onClick={() => {
                setPriceSort(invertSortOrder(sortPrice));
                setQuantitySort(undefined);
              }}
            >
              <SortArrow sort={sortPrice} />
              Price
            </Button>
            <Button
              className="w-50"
              variant="outline"
              onClick={() => {
                setQuantitySort(invertSortOrder(sortQuantity));
                setPriceSort(undefined);
              }}
            >
              <SortArrow sort={sortQuantity} />
              Availability
            </Button>
          </div>
        </div>
        {isAdmin ? (
          <Button
            variant="secondary"
            className="text-emerald-100 bg-emerald-600 dark:text-emerald-200 dark:bg-emerald-900"
            asChild
          >
            <Link to="/products/create">
              <PlusCircleIcon />
              <p className="pl-2">New Product</p>
            </Link>
          </Button>
        ) : (
          ""
        )}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            showAdminEdit={isAdmin}
          >
            <div className="flex flex-wrap gap-2">
              <ProductPurchaseButtons product={product} />
              <Button variant="secondary" asChild>
                <Link
                  to="/products/id/$productId"
                  params={{ productId: product.id }}
                >
                  Details
                </Link>
              </Button>
            </div>
          </ProductCard>
        ))}
      </div>
    </div>
  );
}
