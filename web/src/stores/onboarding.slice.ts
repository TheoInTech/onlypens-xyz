import { StateCreator } from "zustand";
import { ERoles } from "@/stores/constants";
import {
  EToneKeywords,
  ENicheKeywords,
  EContentTypes,
} from "@/schema/enum.schema";

export interface OnboardingSlice {
  step: number;
  setStep: (step: number) => void;
  role: ERoles;
  setRole: (role: ERoles) => void;
  selectedToneKeywords: EToneKeywords[];
  setSelectedToneKeywords: (keywords: EToneKeywords[]) => void;
  selectedNicheKeywords: ENicheKeywords[];
  setSelectedNicheKeywords: (keywords: ENicheKeywords[]) => void;
  selectedContentTypeKeywords: EContentTypes[];
  setSelectedContentTypeKeywords: (keywords: EContentTypes[]) => void;
}

export const createOnboardingSlice: StateCreator<
  OnboardingSlice,
  [],
  [],
  OnboardingSlice
> = (set) => ({
  step: 1,
  setStep: (step: number) => {
    set(() => ({ step }));
  },
  role: ERoles.GHOSTWRITER,
  setRole: (role: ERoles) => {
    set(() => ({ role }));
  },
  selectedToneKeywords: [],
  setSelectedToneKeywords: (keywords: EToneKeywords[]) => {
    set(() => ({ selectedToneKeywords: keywords }));
  },
  selectedNicheKeywords: [],
  setSelectedNicheKeywords: (keywords: ENicheKeywords[]) => {
    set(() => ({ selectedNicheKeywords: keywords }));
  },
  selectedContentTypeKeywords: [],
  setSelectedContentTypeKeywords: (keywords: EContentTypes[]) => {
    set(() => ({ selectedContentTypeKeywords: keywords }));
  },
});
