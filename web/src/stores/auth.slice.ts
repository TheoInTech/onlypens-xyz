import { IUser } from "@/schema/user.schema";
import { StateCreator } from "zustand";

export interface AuthSlice {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  isLoadingUser: boolean;
  setIsLoadingUser: (isLoadingUser: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set
) => ({
  user: null,
  setUser: (user: IUser | null) => {
    set(() => ({ user }));
  },
  isLoadingUser: false,
  setIsLoadingUser: (isLoadingUser: boolean) => {
    set(() => ({ isLoadingUser }));
  },
});
