import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";

import { useClickOutside } from "@iris/hooks";

interface Props {
  projects: any[];
  name: string;
}

interface Data {
  name: string;
  images?: number;
  labels?: string[];
  created?: Date;
  modified?: Date;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator(order: Order, orderBy: any): (a: any, b: any) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => ({ el, index }));
  stabilizedThis.sort((a, b) => {
    const order = comparator(a.el, b.el);
    if (order !== 0) return order;
    return a.index - b.index;
  });
  return stabilizedThis.map(({ el }) => el);
}

const cellSize: { [key: string]: number } = {
  name: -1,
  labels: 350,
  images: 140,
  modified: 200,
};

interface HeadCell {
  id: keyof Data;
  label: string;
}

const headCells: HeadCell[] = [
  { id: "name", label: "Name" },
  { id: "labels", label: "Labels" },
  { id: "images", label: "Images" },
  { id: "modified", label: "Modified" },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead className={classes.tableHead}>
      <TableRow className={classes.tableHeadRow}>
        {headCells.map((headCell) => (
          <TableCell
            className={classes.tableHeadCell}
            key={headCell.id}
            style={
              cellSize[headCell.id] >= 0
                ? {
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: cellSize[headCell.id],
                  }
                : { flexGrow: 1, flexShrink: 1, flexBasis: "auto" }
            }
            align="left"
            padding="none"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell padding="none" style={{ width: 16 }}></TableCell>
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 47,
      // backgroundColor: "var(--secondaryBg)",
      display: "flex",
      alignItems: "center",
    },
    title: {
      padding: "0 24px",
      fontSize: 18,
      marginRight: "auto",
    },
    tableHead: {
      position: "absolute",
      display: "block",
      top: 47,
      left: 16,
      right: 32,
      // paddingRight: 16,
      height: 40,
    },
    tableHeadRow: {
      display: "flex",
      height: "100%",
    },
    tableHeadCell: {
      color: "rgba(255, 255, 255, 0.76)",
      fontSize: 13,
      fontWeight: 500,
      padding: "0 8px",
      display: "flex",
      alignItems: "center",

      "& .MuiTableSortLabel-active": {
        color: "rgba(255, 255, 255, 0.76)",
      },
      "& > .MuiTableSortLabel-root:hover": {
        color: "rgba(255, 255, 255, 1)",
      },
    },
    tableBody: {
      position: "absolute",
      display: "block",
      top: 47 + 40,
      bottom: 0,
      left: 16,
      right: 32,
      paddingRight: 16,
      overflow: "scroll",
      paddingBottom: 32,
      userSelect: "none",
    },
    tableRow: {
      display: "flex",
      height: 48,
      "& .MuiTableCell-root": {
        // borderBottom: "1px solid #393939",
        // borderBottom: "1px solid #262626",
        borderBottom: "1px solid rgba(111, 111, 111, 0.16)",
      },
      "&:last-child .MuiTableCell-root": {
        borderBottom: "1px solid transparent",
      },
      "&.MuiTableRow-hover:hover": {
        backgroundColor: "transparent",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(111, 111, 111, 0.16) !important",
      },
      "& td": {
        color: "rgba(255, 255, 255, 0.51)",
      },
    },
    tableCell: {
      display: "flex",
      alignItems: "center",
      padding: "0 8px",
    },
    root: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "var(--bg)",
    },
    tags: {
      display: "flex",
    },
    tagOverflow: {
      fontSize: 12,
      marginRight: 8,
      padding: "4px 4px",
      color: "#ffffff",
      // backgroundColor: "#273142",
      // backgroundColor: "#263245",
      // backgroundColor: "#212e46",
      backgroundColor: "#263040",

      borderRadius: "6px",
    },
    tag: {
      fontSize: 12,
      marginRight: 8,
      padding: "4px 8px",
      color: "#ffffff",
      // backgroundColor: "#273142",
      // backgroundColor: "#263245",
      // backgroundColor: "#212e46",
      backgroundColor: "#263040",

      borderRadius: "20px",
    },
  })
);

function formatDate(d: Date) {
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getUTCFullYear()}`;
}

function EnhancedTable({
  rows,
  name: connectionName,
}: {
  rows: Data[];
  name: string;
}) {
  const classes = useStyles();
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>("modified");
  const [selected, setSelected] = useState<string[]>([]);

  const history = useHistory();

  const { providerID, connectionID } = useParams<any>();

  const { ref } = useClickOutside<HTMLDivElement>(() => {
    setSelected([]);
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    if (selected.includes(name)) {
      setSelected([]);
      return;
    }
    setSelected([name]);
    return;
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  return (
    <div className={classes.root} ref={ref}>
      <div className={classes.header}>
        <div className={classes.title}>{connectionName}</div>
      </div>
      <TableContainer>
        <Table
          aria-labelledby="tableTitle"
          size="medium"
          aria-label="enhanced table"
        >
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody className={classes.tableBody}>
            {stableSort(rows, getComparator(order, orderBy)).map(
              (row, index) => {
                const isItemSelected = isSelected(row.name);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    onClick={(event) => handleClick(event, row.name)}
                    onDoubleClick={(e) =>
                      history.push(
                        `/projects/${providerID}/${connectionID}/${row.name}`
                      )
                    }
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.name}
                    selected={isItemSelected}
                  >
                    <TableCell
                      className={classes.tableCell}
                      style={
                        cellSize.name >= 0
                          ? {
                              flexGrow: 0,
                              flexShrink: 0,
                              flexBasis: cellSize.name,
                            }
                          : { flexGrow: 1, flexShrink: 1, flexBasis: "auto" }
                      }
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell
                      style={
                        cellSize.labels >= 0
                          ? {
                              flexGrow: 0,
                              flexShrink: 0,
                              flexBasis: cellSize.labels,
                            }
                          : { flexGrow: 1, flexShrink: 1, flexBasis: "auto" }
                      }
                      className={classes.tableCell}
                      align="left"
                    >
                      {row.labels && row.labels.length > 0 ? (
                        <div className={classes.tags}>
                          {row.labels.map((l) => (
                            <div className={classes.tag}>{l}</div>
                          ))}
                          {/* <div className={classes.tagOverflow}>+2</div> */}
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell
                      style={
                        cellSize.images >= 0
                          ? {
                              flexGrow: 0,
                              flexShrink: 0,
                              flexBasis: cellSize.images,
                            }
                          : { flexGrow: 1, flexShrink: 1, flexBasis: "auto" }
                      }
                      className={classes.tableCell}
                      align="left"
                    >
                      {row.images ? row.images.toLocaleString() : "—"}
                    </TableCell>
                    <TableCell
                      style={
                        cellSize.modified >= 0
                          ? {
                              flexGrow: 0,
                              flexShrink: 0,
                              flexBasis: cellSize.modified,
                            }
                          : { flexGrow: 1, flexShrink: 1, flexBasis: "auto" }
                      }
                      className={classes.tableCell}
                      align="left"
                    >
                      {row.modified ? formatDate(row.modified) : "—"}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function Main({ projects, name }: Props) {
  return (
    <EnhancedTable
      name={name}
      rows={[
        ...projects.map((p) => ({
          name: p.name,
          labels: Object.values(p.labels).map((l: any) => l.name),
          images: p.images,
          created: p.created ? new Date(p.created) : undefined,
          modified: p.modified ? new Date(p.modified) : undefined,
        })),
      ]}
    />
  );
}

export default Main;
