"use client";

import { Switch } from "@mantine/core";
import React, { useState } from "react";
import { IconStarFilled, IconGhost3Filled } from "@tabler/icons-react";
import { useGlobalStore } from "@/stores";
import { ERoles } from "@/stores/constants";

export const RoleSwitch = () => {
  const [checked, setChecked] = useState<boolean>(false);
  const { setRole } = useGlobalStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.currentTarget.checked);
    setRole(event.currentTarget.checked ? ERoles.CREATOR : ERoles.GHOSTWRITER);
  };

  return (
    <Switch
      checked={checked}
      onChange={handleChange}
      color="blue.4"
      onLabel="Creator"
      offLabel="Ghostwriter"
      labelPosition="left"
      size="xl"
      styles={{
        track: {
          backgroundColor: checked
            ? undefined
            : "var(--mantine-color-purple-3)",
          color: "var(--mantine-color-white)",
          width: "200px",
          height: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        },
        trackLabel: {
          fontSize: "1.2rem",
          fontWeight: 500,
          padding: "0 16px",
          zIndex: 2,
        },
        thumb: {
          width: "40px",
          height: "40px",
          zIndex: 3,
          position: "absolute",
          left: checked ? "calc(100% - 45px)" : "5px",
          transition: "left 0.2s ease-in-out",
        },
      }}
      thumbIcon={
        checked ? (
          <IconStarFilled size={30} color="var(--mantine-color-yellow-6)" />
        ) : (
          <IconGhost3Filled size={30} color="var(--mantine-color-purple-3)" />
        )
      }
    />
  );
};
