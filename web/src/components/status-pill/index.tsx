import { Box } from "@mantine/core";
import React from "react";
import classes from "./status-pill.module.css";
import { GigStatus, GigStatusLabels } from "@/schema/gig.schema";
import clsx from "clsx";

type StatusPillSize = "sm" | "md" | "lg";

interface IStatusPill {
  status: GigStatus;
  size?: StatusPillSize;
  fullWidth?: boolean;
}

export const StatusPill = ({
  status,
  size = "sm",
  fullWidth = false,
}: IStatusPill) => {
  const getStatusClass = (status: GigStatus): string => {
    switch (status) {
      case GigStatus.PENDING:
        return classes.pending;
      case GigStatus.INVITED:
        return classes.invited;
      case GigStatus.ASSIGNED:
        return classes.assigned;
      case GigStatus.IN_PROGRESS:
        return classes["in-progress"];
      case GigStatus.COMPLETED:
        return classes.completed;
      case GigStatus.CANCELLED:
        return classes.cancelled;
      case GigStatus.AUTO_RELEASED:
        return classes["auto-released"];
      default:
        return classes.pending;
    }
  };

  return (
    <Box
      className={clsx(
        classes.status,
        classes[size],
        getStatusClass(status),
        fullWidth && classes.fullWidth
      )}
    >
      {GigStatusLabels[status]}
    </Box>
  );
};
