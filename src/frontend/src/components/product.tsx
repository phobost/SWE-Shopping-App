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
import {
  getNewProductDoc,
  getProductStorageRef,
  getSalePrice,
  setProduct,
} from "@/helpers/product/util";
import React from "react";
import { PartialKeys } from "@tanstack/react-table";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { USD } from "@/lib/utils";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/helpers/firebaseConfig";

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
  const salePrice = getSalePrice(product);
  const onSale = salePrice !== product.price;

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
      <h3 className="font-semibold text-lg">{product.name}</h3>

      <div className="flex flex-row gap-2">
        <Badge>
          <div className={onSale ? "line-through text-red-600" : ""}>
            {USD.fromNumber(product.price)}
          </div>
          {onSale ? (
            <div className="font-bold text-green-300 dark:text-green-800">
              {USD.fromNumber(salePrice)}
            </div>
          ) : (
            ""
          )}
        </Badge>
        {onSale ? (
          <Badge className="bg-emerald-500 dark:bg-emerald-300 font-bold">
            {product.salePercentage}% off!
          </Badge>
        ) : (
          ""
        )}
      </div>
      <p className="text-sm text-muted-foreground">{product.description}</p>

      <div className="flex flex-col place-items-center ">
        <img
          src={product.primaryImageUrl}
          className="object-cover rounded-lg snap-center"
        />
        <p className="text-sm">In Stock: {product.quantityInStock}</p>
        {children && <div className="pt-4">{children}</div>}
      </div>
    </div>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const salePrice = getSalePrice(product);
  const onSale = salePrice !== product.price;

  return (
    <>
      <div className="pt-4">
        <h1 className="text-6xl font-bold">{product.name}</h1>
        <div className="flex flex-row gap-2 pt-2 pb-2">
          <Badge>
            <div className={onSale ? "line-through text-red-600" : ""}>
              {USD.fromNumber(product.price)}
            </div>
            {onSale ? (
              <div className="font-bold text-green-300 dark:text-green-800">
                {USD.fromNumber(salePrice)}
              </div>
            ) : (
              ""
            )}
          </Badge>
          {onSale ? (
            <Badge className="bg-emerald-500 dark:bg-emerald-300 font-bold">
              {product.salePercentage}% off!
            </Badge>
          ) : (
            ""
          )}
        </div>
        <p className="text-lg text-muted-foreground">{product.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ProductPurchaseButtons product={product} />
        </div>
        <div className="pt-8 flex">
          <img
            src={product.primaryImageUrl}
            className="object-cover rounded-lg snap-center"
          />
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
  const quantityInStockRepr =
    quantityInStock !== undefined ? quantityInStock : "";

  const [salePercentage, setSalePercentage] = React.useState<
    undefined | number
  >(product.salePercentage);
  const salePercentageRepr = salePercentage !== undefined ? salePercentage : "";

  const [markdownBody, setMarkdownBody] = React.useState(product.body.markdown);
  const [htmlBody, setHtmlBody] = React.useState(product.body.html);
  const [isAvailable, setIsAvailable] = React.useState(
    product.isAvailable === undefined ? true : product.isAvailable,
  );
  const [primaryImageUrl, setPrimaryImageUrl] = React.useState(
    product.primaryImageUrl,
  );

  const [primaryImage, setPrimaryImage] = React.useState<File | undefined>(
    undefined,
  );

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
    primaryImage: () => {
      if (primaryImage === undefined && primaryImageUrl === undefined) {
        return "Image may not be empty!";
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
    salePercentage: () => {
      if (salePercentage === undefined) {
        return;
      }

      if (salePercentage < 0) {
        return "Sale percentage cannot be negative!";
      }

      if (salePercentage > 100) {
        return "Sale percentage cannot be more than 100!";
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
    id: getNewProductDoc().id,
    ...product,
    name: name.trim(),
    price: Number(USD.removeSymbols(priceStr)),
    primaryImageUrl,
    quantityInStock,
    isAvailable,
    salePercentage: salePercentage || 0,
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
              <ProductDetails product={{ ...updatedProduct } as Product} />
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

                <Field className="grid w-full max-w-xs items-center gap-3">
                  <Label htmlFor="picture">Set Image</Label>
                  <Input
                    type="file"
                    placeholder="Picture"
                    accept="image/*"
                    onChange={async (event) => {
                      if (
                        !event.target.files ||
                        event.target.files[0] == null
                      ) {
                        return;
                      }

                      const image = event.target.files[0];
                      const res = await uploadBytes(
                        ref(storage, `products/${product.id}/edit-primary`),
                        image,
                      );
                      setPrimaryImage(image);
                      setPrimaryImageUrl(await getDownloadURL(res.ref));
                    }}
                  />

                  <ValidationError msg={validate.primaryImage()} />
                </Field>
              </Field>
              <div className="grid grid-cols-3 gap-12 place-items-center justify-items-stretch place-items-start ">
                <div>
                  <Field>
                    <FieldLabel htmlFor="product-price-field">
                      Product Price
                    </FieldLabel>
                    <InputGroup className="max-w-40">
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
                    <ValidationError msg={validate.price()} />
                  </Field>
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
                            let newQuant =
                              (quantityInStock ? quantityInStock : 0) - 1;
                            newQuant = Math.max(newQuant, 0);

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

                    <ValidationError msg={validate.quantityInStock()} />
                  </Field>
                </div>
                <div>
                  <Field>
                    <FieldLabel htmlFor="product-quantity-field">
                      Sale Percentage
                    </FieldLabel>
                    <div
                      className={`flex flex-row min-w-30 max-w-40  ${salePercentage === undefined ? "" : salePercentage > 0 ? "text-purple-800 dark:text-purple-300 font-bold" : ""}`}
                    >
                      <InputGroup>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            let newQuant =
                              (salePercentage ? salePercentage : 0) - 1;
                            newQuant = Math.max(newQuant, 0);

                            setSalePercentage(newQuant);
                          }}
                        >
                          <CircleMinusIcon />
                        </Button>
                        <InputGroupInput
                          id="product-quantity-field"
                          required
                          value={salePercentageRepr}
                          className="text-center"
                          placeholder="0"
                          step="1"
                          inputMode="numeric"
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            if (val == "") {
                              setSalePercentage(undefined);
                              return;
                            }

                            const newQuantity = Number(val);
                            if (isNaN(newQuantity)) {
                              return;
                            }

                            setSalePercentage(newQuantity);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newQuant =
                              (salePercentage ? salePercentage : 0) + 1;

                            setSalePercentage(Math.max(newQuant, 100));
                          }}
                        >
                          <CirclePlusIcon />
                        </Button>
                      </InputGroup>
                    </div>
                    <ValidationError msg={validate.salePercentage()} />
                  </Field>
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
                  let imageUrl = primaryImageUrl;
                  if (primaryImage !== undefined) {
                    imageUrl = await getDownloadURL(
                      (
                        await uploadBytes(
                          getProductStorageRef(updatedProduct.id),
                          primaryImage,
                        )
                      ).ref,
                    );
                  }

                  const createdProduct = await setProduct({
                    ...updatedProduct,
                    quantityInStock: quantityInStock as number,
                    primaryImageUrl: imageUrl,
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
