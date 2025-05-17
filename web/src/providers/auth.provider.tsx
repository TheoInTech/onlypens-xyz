"use client";

import { getUserProfile } from "@/services/user.service";
import { useGlobalStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const pathname = usePathname();
  const { setUser, setIsLoadingUser } = useGlobalStore();
  const { data: session } = useSession();

  const {
    data: fetchedUser,
    isFetched,
    isRefetching,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUserProfile,
    refetchInterval: 60000, // 1 minute
  });

  useEffect(() => {
    if (isFetched && !isRefetching) {
      try {
        setUser(fetchedUser || null);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
    }

    if (isRefetching || isFetching) {
      setIsLoadingUser(true);
    }

    if (isFetched && !isRefetching && !isFetching && !!fetchedUser) {
      setIsLoadingUser(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isFetched, isRefetching, fetchedUser]);

  useEffect(() => {
    (async () => {
      await refetch();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <>{children}</>;
};

export default AuthProvider;
