import { Stack } from "@mantine/core";
import React from "react";
import classes from "./auth-layout.module.css";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return <Stack className={classes.authLayout}>{children}</Stack>;
};

export default AuthenticatedLayout;
