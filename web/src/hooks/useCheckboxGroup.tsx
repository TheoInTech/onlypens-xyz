import { useGlobalStore } from "@/stores";
import {
  EToneKeywords,
  ENicheKeywords,
  EContentTypes,
} from "@/schema/enum.schema";
import { Group } from "@mantine/core";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components";
import { ERoles } from "@/stores/constants";

export const useCheckboxGroup = () => {
  const {
    role,
    selectedToneKeywords,
    setSelectedToneKeywords,
    selectedNicheKeywords,
    setSelectedNicheKeywords,
    selectedContentTypeKeywords,
    setSelectedContentTypeKeywords,
  } = useGlobalStore();

  const [localToneKeywords, setLocalToneKeywords] =
    useState<string[]>(selectedToneKeywords);
  const [localNicheKeywords, setLocalNicheKeywords] = useState<string[]>(
    selectedNicheKeywords
  );
  const [localContentTypeKeywords, setLocalContentTypeKeywords] = useState<
    string[]
  >(selectedContentTypeKeywords);

  const [toneWarningVisible, setToneWarningVisible] = useState(false);
  const [nicheWarningVisible, setNicheWarningVisible] = useState(false);
  const [contentTypeWarningVisible, setContentTypeWarningVisible] =
    useState(false);

  const toneWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nicheWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentTypeWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generic keyword toggle handler with useCallback
  const handleKeywordToggle = useCallback(
    <T extends string>(
      keyword: string,
      isChecked: boolean,
      localKeywords: string[],
      setLocalKeywords: (keywords: string[]) => void,
      globalSetKeywords: (keywords: T[]) => void,
      maxAllowed: number,
      warningVisible: boolean,
      setWarningVisible: (visible: boolean) => void,
      warningTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    ) => {
      let newKeywords: string[];

      if (isChecked) {
        // Don't add if we already have reached max allowed
        if (maxAllowed > 0 && localKeywords.length >= maxAllowed) {
          // Show the warning and auto-hide after 3 seconds
          setWarningVisible(true);

          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
          }

          warningTimeoutRef.current = setTimeout(() => {
            setWarningVisible(false);
          }, 3000);

          return;
        }
        newKeywords = [...localKeywords, keyword];
      } else {
        newKeywords = localKeywords.filter((k) => k !== keyword);
        // Hide warning if showing
        if (warningVisible) {
          setWarningVisible(false);
          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
          }
        }
      }

      setLocalKeywords(newKeywords);
      globalSetKeywords(newKeywords as T[]);
    },
    []
  );

  // Memoized specialized handlers for each keyword type
  const handleToneKeywordToggle = useCallback(
    (keyword: string, isChecked: boolean) => {
      handleKeywordToggle<EToneKeywords>(
        keyword,
        isChecked,
        localToneKeywords,
        setLocalToneKeywords,
        setSelectedToneKeywords,
        5, // Max allowed tone keywords
        toneWarningVisible,
        setToneWarningVisible,
        toneWarningTimeoutRef
      );
    },
    [
      handleKeywordToggle,
      localToneKeywords,
      toneWarningVisible,
      setSelectedToneKeywords,
    ]
  );

  const handleNicheKeywordToggle = useCallback(
    (keyword: string, isChecked: boolean) => {
      handleKeywordToggle<ENicheKeywords>(
        keyword,
        isChecked,
        localNicheKeywords,
        setLocalNicheKeywords,
        setSelectedNicheKeywords,
        role === ERoles.GHOSTWRITER ? 10 : 3, // Max allowed niche keywords
        nicheWarningVisible,
        setNicheWarningVisible,
        nicheWarningTimeoutRef
      );
    },
    [
      handleKeywordToggle,
      localNicheKeywords,
      nicheWarningVisible,
      setSelectedNicheKeywords,
      role,
    ]
  );

  const handleContentTypeToggle = useCallback(
    (keyword: string, isChecked: boolean) => {
      handleKeywordToggle<EContentTypes>(
        keyword,
        isChecked,
        localContentTypeKeywords,
        setLocalContentTypeKeywords,
        setSelectedContentTypeKeywords,
        -1, // Max allowed niche keywords
        contentTypeWarningVisible,
        setContentTypeWarningVisible,
        nicheWarningTimeoutRef
      );
    },
    [
      handleKeywordToggle,
      localContentTypeKeywords,
      contentTypeWarningVisible,
      setSelectedContentTypeKeywords,
    ]
  );

  // Memoize the checkbox groups to prevent unnecessary re-renders
  const toneCheckboxes = useMemo(
    () => (
      <Group style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
        {Object.values(EToneKeywords).map((keyword) => (
          <Checkbox
            key={keyword}
            label={keyword}
            checked={localToneKeywords.includes(keyword)}
            onChange={(isChecked: boolean) =>
              handleToneKeywordToggle(keyword, isChecked)
            }
          />
        ))}
      </Group>
    ),
    [localToneKeywords, handleToneKeywordToggle]
  );

  const nicheCheckboxes = useMemo(
    () => (
      <Group style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
        {Object.values(ENicheKeywords).map((keyword) => (
          <Checkbox
            key={keyword}
            label={keyword}
            checked={localNicheKeywords.includes(keyword)}
            onChange={(isChecked: boolean) =>
              handleNicheKeywordToggle(keyword, isChecked)
            }
          />
        ))}
      </Group>
    ),
    [localNicheKeywords, handleNicheKeywordToggle]
  );

  const contentTypeCheckboxes = useMemo(
    () => (
      <Group style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
        {Object.values(EContentTypes).map((keyword) => (
          <Checkbox
            key={keyword}
            label={keyword}
            checked={localContentTypeKeywords.includes(keyword)}
            onChange={(isChecked: boolean) =>
              handleContentTypeToggle(keyword, isChecked)
            }
          />
        ))}
      </Group>
    ),
    [localContentTypeKeywords, handleContentTypeToggle]
  );

  // Clear timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (toneWarningTimeoutRef.current) {
        clearTimeout(toneWarningTimeoutRef.current);
      }
      if (nicheWarningTimeoutRef.current) {
        clearTimeout(nicheWarningTimeoutRef.current);
      }
      if (contentTypeWarningTimeoutRef.current) {
        clearTimeout(contentTypeWarningTimeoutRef.current);
      }
    };
  }, []);

  return {
    toneCheckboxes,
    nicheCheckboxes,
    contentTypeCheckboxes,
    toneWarningVisible,
    nicheWarningVisible,
    contentTypeWarningVisible,
  };
};
