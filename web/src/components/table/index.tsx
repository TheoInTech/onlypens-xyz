"use client";

import { useState } from "react";
import cx from "clsx";
import { ScrollArea, Table as MantineTable } from "@mantine/core";
import classes from "./table.module.css";

interface TableRow {
  [key: string]: string | number | React.ReactNode;
}

interface ITable {
  columns: {
    key: string;
    label: string;
  }[];
  data: TableRow[];
}

export const Table = ({ columns, data }: ITable) => {
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((row, index) => (
    <MantineTable.Tr key={`row-${index}`} className={classes.row}>
      {columns.map((column) => (
        <MantineTable.Td key={`${index}-${column.key}`}>
          {row[column.key]}
        </MantineTable.Td>
      ))}
    </MantineTable.Tr>
  ));

  return (
    <ScrollArea
      h={300}
      onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
    >
      <MantineTable miw={700}>
        <MantineTable.Thead
          className={cx(classes.header, { [classes.scrolled]: scrolled })}
        >
          <MantineTable.Tr>
            {columns.map((column) => (
              <MantineTable.Th key={column.key}>{column.label}</MantineTable.Th>
            ))}
          </MantineTable.Tr>
        </MantineTable.Thead>
        <MantineTable.Tbody>{rows}</MantineTable.Tbody>
      </MantineTable>
    </ScrollArea>
  );
};
