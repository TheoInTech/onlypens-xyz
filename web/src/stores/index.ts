import { createSelectors } from "@/stores/createSelectors";
import { create } from "zustand";

import {
  OnboardingSlice,
  createOnboardingSlice,
} from "@/stores/onboarding.slice";

type GlobalStore = OnboardingSlice;

const useGlobalStoreObj = create<GlobalStore>()((...a) => ({
  ...createOnboardingSlice(...a),
}));

export const useGlobalStore = createSelectors(useGlobalStoreObj);
