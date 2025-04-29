import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function shortenAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}
