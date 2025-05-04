import { EContentTypes } from "@/schema/enum.schema";
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

export function getAmountFromDecimals(amount: string, decimals: number) {
  return Number(amount) / 10 ** decimals;
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
    default:
      return "/placeholder.png";
  }
}
