import { EContentTypes } from "@/schema/enum.schema";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function shortenAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
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

export function getAmountFromDecimals(amount: string, decimals: number) {
  return Number(amount) / 10 ** decimals;
}

export function getTimeUntil(timestamp: number) {
  const now = Date.now();
  const diffTime = timestamp - now;

  // Return a message if the timestamp has already passed
  if (diffTime <= 0) {
    return "Expired";
  }

  const diffSeconds = Math.floor(diffTime / 1000) % 60;
  const diffMinutes = Math.floor(diffTime / (1000 * 60)) % 60;
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60)) % 24;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
  }

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }

  if (diffMinutes > 0) {
    return `${diffMinutes}m ${diffSeconds}s`;
  }

  return `${diffSeconds}s`;
}

export function unixTimestampToDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate().toString().padStart(2, "0");
  return `${year} ${month} ${day}`;
}

export function getContentTypeIcon(contentType: string) {
  switch (contentType) {
    case EContentTypes.BLOG_NEWSLETTER:
      return "blog-newsletter.png";
    case EContentTypes.PRODUCT_MARKETING:
      return "product-copy.png";
    case EContentTypes.SOCIAL_POST:
      return "social-post.png";
    case EContentTypes.SOCIAL_THREAD:
      return "social-thread.png";
    case EContentTypes.SHORT_CAPTION:
      return "short-caption.png";
    case EContentTypes.WEBSITE_LANDING:
      return "website-headline.png";
    case EContentTypes.SCRIPT_DIALOGUE:
      return "script-dialogue.png";
    case EContentTypes.PERSONAL_BIO:
      return "short-bio.png";
    case EContentTypes.BOOK:
      return "book.png";
    case EContentTypes.WHITEPAPER:
      return "whitepaper.png";
    default:
      return "/placeholder.png";
  }
}

// Cookie utility functions
export const cookie = {
  set: (name: string, value: string, days = 7) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${expires}; path=/`;
  },
  get: (name: string) => {
    const cookieArray = document.cookie.split(";");
    const cookieValue = cookieArray
      .find((item) => item.trim().startsWith(`${name}=`))
      ?.trim()
      .substring(name.length + 1);
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  },
  delete: (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  },
};
