import {
  AlertCircle,
  CircleMinusIcon,
  CirclePlusIcon,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@shared/types/product";
import { Button } from "./ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { AddProductToCartButton } from "./cart";
import { ReactNode } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { setProduct } from "@/helpers/product/util";
import React from "react";
import { PartialKeys } from "@tanstack/react-table";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { USD } from "@/lib/utils";

export function ProductPurchaseButtons({ product }: { product: Product }) {
  return product.isAvailable ? (
    <>
      {product.quantityInStock > 0 ? (
        <>
          <AddProductToCartButton product={product} />
          <Button>
            <Link to="/checkout">Buy now</Link>
          </Button>
        </>
      ) : (
        <>
          <Badge variant="destructive" className="!bg-zinc-700">
            Out of Stock
          </Badge>
        </>
      )}
    </>
  ) : (
    <Badge variant="destructive">Not Available</Badge>
  );
}

export function ProductCard({
  product,
  children,
  showAdminEdit,
}: {
  product: Product;
  children?: ReactNode;
  showAdminEdit?: boolean;
  editHref?: string;
}) {
  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-2">
      {showAdminEdit && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="absolute right-3 top-3 h-8 w-8 rounded-full"
        >
          <Link
            to="/products/id/$productId/edit"
            params={{ productId: product.id }}
          >
            <span className="sr-only">Edit product</span>
            ⚙️
          </Link>
        </Button>
      )}
      <h3 className="font-semibold text-lg">
        {product.name} | {USD.fromNumber(product.price)}
      </h3>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <p className="text-sm">In Stock: {product.quantityInStock}</p>
      {children && <div className="pt-4">{children}</div>}
    </div>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  return (
    <>
      <div className="pt-4">
        <h1 className="text-6xl font-bold">
          {product.name} | {USD.fromNumber(product.price)}
        </h1>
        <p className="text-lg text-muted-foreground">{product.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <ProductPurchaseButtons product={product} />
        </div>

        <div className="pt-8 product-body">
          <div dangerouslySetInnerHTML={{ __html: product.body.html }}></div>
        </div>
      </div>
    </>
  );
}

function ValidationError({ msg }: { msg?: string }) {
  if (msg) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>{msg}</span>
      </div>
    );
  }
}

export function ProductEditor({
  product: product,
}: {
  product?: PartialKeys<Product, "id">;
}) {
  const router = useRouter();

  product = product
    ? product
    : ({
        name: "",
        description: "",
        base64Image: "",
        price: 0,
        quantityInStock: 0,
        body: {
          html: "",
          markdown: "",
        },
      } as PartialKeys<Product, "id">);

  const [value, setValue] = React.useState(false);
  const forceUpdate = () => setValue(!value);
  const [name, setName] = React.useState(product.name);
  const [priceStr, setPrice] = React.useState(
    USD.fromNumber(product.price).replace("$", ""),
  );
  const [description, setDescription] = React.useState(product.description);
  const [quantityInStock, setQuantityInStock] = React.useState<
    undefined | number
  >(product.quantityInStock);
  console.log(product.quantityInStock);
  const quantityInStockRepr =
    quantityInStock !== undefined ? quantityInStock : "";
  const [markdownBody, setMarkdownBody] = React.useState(product.body.markdown);
  const [htmlBody, setHtmlBody] = React.useState(product.body.html);
  const [isAvailable, setIsAvailable] = React.useState(product.isAvailable);

  const validate = {
    name: () => {
      const nameTrimmed = name.trim();
      if (nameTrimmed.length > 40) {
        return "Product name cannot be more than 40 characters!";
      }

      if (nameTrimmed.length == 0) {
        return "Product name cannot be empty!";
      }
    },
    price: () => {
      const priceNum = Number(priceStr);

      if (priceStr.trim() == "") {
        return "Price cannot be empty!";
      }

      if (isNaN(priceNum)) {
        return "Price is not a number!";
      }

      if (priceNum < 0) {
        return "Price cannot be negative!";
      }
    },
    quantityInStock: () => {
      if (quantityInStock === undefined) {
        return "Quantity in stock cannot be empty!";
      }

      if (quantityInStock < 0) {
        return "Quantity in stock cannot be negative!";
      }
    },
    description: () => {
      const desc = description.trim();
      if (desc.length > 120) {
        return "Description is too long!";
      }

      if (desc.length == 0) {
        return "Description cannot be empty";
      }
    },
    body: () => {
      const bodyTrimmed = markdownBody.trim();
      if (bodyTrimmed.length == 0) {
        return "Body cannot be empty!";
      }
    },
  };

  const formHasError = () => {
    return Object.values(validate).find((callback) => {
      return callback() != undefined;
    });
  };

  const getHtmlBody = async (markdown: string) => {
    return await (
      await fetch("https://phobost-api.pricehiller.com/v1/md2html", {
        method: "POST",
        body: markdown.trim(),
      })
    ).text();
  };

  const updatedProduct = {
    ...product,
    name: name.trim(),
    price: Number(USD.removeSymbols(priceStr)),
    quantityInStock,
    isAvailable,
    body: {
      markdown: markdownBody,
      html: htmlBody,
    },
    description: description.trim(),
  };

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <Button
            variant="secondary"
            type="button"
            className="mb-4"
            onClick={async () => {
              setHtmlBody(await getHtmlBody(markdownBody));
            }}
          >
            <Eye /> Toggle Preview
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-fit min-w-19/20 overflow-y-auto h-5/6">
          <ScrollArea className="flex pr-4">
            <div className="pointer-events-none">
              <ProductDetails
                product={{ id: "fake-id", ...updatedProduct } as Product}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="product-name-field">
                  Product Name
                </FieldLabel>
                <Input
                  id="product-name-field"
                  placeholder="Product Name..."
                  minLength={1}
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
                <ValidationError msg={validate.name()} />
                <Field orientation="horizontal">
                  <Switch
                    checked={isAvailable}
                    onClick={() => setIsAvailable(!isAvailable)}
                    id="airplane-mode"
                  />
                  <Label htmlFor="airplane-mode">Availble for Purchase</Label>
                </Field>
              </Field>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Field>
                    <FieldLabel htmlFor="product-price-field">
                      Product Price
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="product-price-field"
                        required
                        value={priceStr}
                        min="0"
                        placeholder="0.00"
                        inputMode="decimal"
                        step="0.01"
                        onChange={(e) => {
                          if (!e) {
                            forceUpdate();
                            return;
                          }
                          const valueStr = e.target.value.trim();

                          if (valueStr == "") {
                            setPrice("");
                            return;
                          }

                          if (isNaN(Number(valueStr))) {
                            return;
                          }

                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const [_, decimalPart] = valueStr.split(".");
                          if (
                            decimalPart !== undefined &&
                            decimalPart.length > 2
                          ) {
                            return;
                          }

                          setPrice(valueStr);
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>USD</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                  <ValidationError msg={validate.price()} />
                </div>

                <div>
                  <Field>
                    <FieldLabel htmlFor="product-quantity-field">
                      Quantity in Stock
                    </FieldLabel>
                    <div className="flex flex-row min-w-30 max-w-40">
                      <InputGroup>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            console.log(quantityInStock);
                            let newQuant =
                              (quantityInStock ? quantityInStock : 0) - 1;
                            newQuant = Math.max(newQuant, 0);

                            console.log("After", newQuant);
                            setQuantityInStock(newQuant);
                          }}
                        >
                          <CircleMinusIcon />
                        </Button>
                        <InputGroupInput
                          id="product-quantity-field"
                          required
                          value={quantityInStockRepr}
                          className="text-center"
                          placeholder="0"
                          step="1"
                          inputMode="numeric"
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val == "") {
                              setQuantityInStock(undefined);
                              return;
                            }

                            const newQuantity = Number(val);
                            if (isNaN(newQuantity)) {
                              return;
                            }

                            setQuantityInStock(newQuantity);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newQuant =
                              (quantityInStock ? quantityInStock : 0) + 1;

                            setQuantityInStock(newQuant);
                          }}
                        >
                          <CirclePlusIcon />
                        </Button>
                      </InputGroup>
                    </div>
                  </Field>
                  <ValidationError msg={validate.quantityInStock()} />
                </div>
                <div>
                  <Field></Field>
                  <ValidationError msg={validate.quantityInStock()} />
                </div>
              </div>
              <Field>
                <FieldLabel htmlFor="product-short-description-field">
                  Short Product Description
                </FieldLabel>
                <Input
                  id="product-short-description-field"
                  placeholder="A compelling description of the product"
                  required
                  minLength={1}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
                <FieldDescription>
                  No more than 120 characters | ({description.length}/120)
                </FieldDescription>
                <ValidationError msg={validate.description()} />
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLegend>Content Body</FieldLegend>
                <FieldDescription>
                  The content displayed on the detailed product page.
                </FieldDescription>
                <Textarea
                  placeholder="Write in a detailed content body for the product"
                  className="min-h-80 resize-y"
                  minLength={1}
                  value={markdownBody}
                  onChange={(e) => {
                    setMarkdownBody(e.target.value);
                  }}
                />
              </Field>
              <ValidationError msg={validate.body()} />
            </FieldGroup>
          </FieldSet>

          <Field orientation="horizontal">
            {formHasError() ? (
              <Button type="submit" disabled>
                Submit
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={async (e) => {
                  e.preventDefault();
                  if (formHasError()) {
                    toast.error("The form has an error, cannot submit");
                    return;
                  }

                  if (quantityInStock == undefined) {
                    throw new Error(
                      "Quantity in stock as still not available after form check was done!",
                    );
                  }

                  const updatedMarkdown = updatedProduct.body.markdown.trim();
                  const createdProduct = await setProduct({
                    ...updatedProduct,
                    quantityInStock: quantityInStock as number,
                    body: {
                      markdown: updatedMarkdown,
                      html: await getHtmlBody(updatedMarkdown),
                    },
                  } as Product);
                  router.navigate({
                    to: "/products/id/$productId",
                    params: {
                      productId: createdProduct.id,
                    },
                  });
                }}
              >
                Submit
              </Button>
            )}
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                if (!router.history.canGoBack()) {
                  router.navigate({
                    to: "/products",
                  });
                } else {
                  router.history.back();
                }
              }}
            >
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </>
  );
}
