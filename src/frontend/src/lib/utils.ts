import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const USD = {
  removeSymbols: (val: string): string => {
    return val.replace("$", "").replaceAll(",", "");
  },
  toNumber: (val: string): number | undefined => {
    const num = Number(USD.removeSymbols(val));
    if (isNaN(num)) {
      return undefined;
    }
    return num;
  },
  fromNumber: (
    val: number,
    options?: Omit<Omit<Intl.NumberFormatOptions, "style">, "currency">,
  ): string => {
    return new Intl.NumberFormat("en-US", {
      ...options,
      style: "currency",
      currency: "USD",
    }).format(val);
  },
};
