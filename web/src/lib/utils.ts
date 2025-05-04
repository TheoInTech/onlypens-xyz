import { EActivityStatus } from "@/schema/enum.schema";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function shortenAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export function timestampAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffTime = Math.abs(now - date.getTime());

  // Less than a minute
  if (diffTime < 60 * 1000) {
    return "< 1 min ago";
  }

  // Minutes
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  // Hours
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  if (diffHours < 24) {
    return `${diffHours} hrs ago`;
  }

  // Days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

export function getStatusColor(status: EActivityStatus) {
  switch (status) {
    case EActivityStatus.SUCCESS:
      return "purple.9";
    case EActivityStatus.INFO:
      return "blue.4";
    case EActivityStatus.PENDING:
      return "yellow.7";
    case EActivityStatus.WARNING:
      return "orange.7";
    case EActivityStatus.ERROR:
      return "red.7";
    default:
      return "midnight.9";
  }
}
