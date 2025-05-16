"use client";

import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export const NProgress = () => {
  const pathname = usePathname();

  useEffect(() => {
    nprogress.complete();

    return () => {
      nprogress.start();
    };
  }, [pathname]);

  return <NavigationProgress size={8} color="#a264ff" zIndex={999999999} />;
};
