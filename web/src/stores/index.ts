import { createSelectors } from "@/stores/createSelectors";
import { create } from "zustand";

import {
  OnboardingSlice,
  createOnboardingSlice,
} from "@/stores/onboarding.slice";
import { createAuthSlice, AuthSlice } from "@/stores/auth.slice";

type GlobalStore = OnboardingSlice & AuthSlice;

const useGlobalStoreObj = create<GlobalStore>()((...a) => ({
  ...createOnboardingSlice(...a),
  ...createAuthSlice(...a),
}));

export const useGlobalStore = createSelectors(useGlobalStoreObj);
