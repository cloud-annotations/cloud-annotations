/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createMuiTheme } from "@material-ui/core";

declare module "@material-ui/core/styles/createPalette" {
  interface Palette {
    danger: Palette["primary"];
  }
  interface PaletteOptions {
    danger: PaletteOptions["primary"];
  }
}

const theme = createMuiTheme({
  typography: {
    allVariants: {
      letterSpacing: 0.16,
    },
    fontFamily: [
      "IBM Plex Sans",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    type: "dark",
    grey: {
      50: "#f2f4f8",
      100: "#dde1e6",
      200: "#c1c7cd",
      300: "#a2a9b0",
      400: "#878d96",
      500: "#697077",
      600: "#4d5358",
      700: "#343a3f",
      800: "#1b1f21",
      900: "#121619",
    },
    danger: {
      main: "#da1e28",
      dark: "#ba1b23",
      contrastText: "white",
    },
    secondary: {
      main: "#6f6f6f",
      dark: "#606060",
      contrastText: "white",
    },
    primary: {
      light: "#78a9ff",
      main: "#0f62fe",
      dark: "#0353e9",
      contrastText: "white",
    },
    text: {
      primary: "rgba(255, 255, 255, 1)",
      secondary: "rgba(255, 255, 255, 0.87)",
      disabled: "rgba(255, 255, 255, 0.2)",
      hint: "rgba(255, 255, 255, 0.53)",
    },
    action: {
      hover: "rgba(255, 255, 255, 0.06)",
    },
  },
  shape: {
    borderRadius: 0,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  shadows: [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
});

theme.palette.background = {
  default: theme.palette.grey[900],
  paper: theme.palette.grey[800],
};

theme.overrides = {
  MuiCssBaseline: {
    "@global": {
      body: {
        lineHeight: 1,
      },
    },
  },
  MuiDialogTitle: {
    root: {
      fontSize: "1.25rem",
      fontWeight: 400,
      padding: "1rem 20% 0 1rem",
      margin: "0 0 1rem 0",
    },
  },
  MuiDialogContent: {
    root: {
      padding: "0 20% 0 1rem",
      margin: "0 0 3rem 0",
    },
  },
  MuiDialogContentText: {
    root: {
      fontSize: "0.875rem",
      fontWeight: 400,
      marginBottom: 0,
    },
  },
  MuiDialogActions: {
    spacing: {
      "& > :not(:first-child)": {
        marginLeft: 1,
      },
    },
    root: {
      height: "4rem",
      padding: 0,
      "& .MuiButton-root": {
        lineHeight: 1.29,
        fontWeight: 400,
        padding: "1rem",
        alignItems: "start",
        height: "100%",
        width: "100%",
      },
    },
  },
  MuiInput: {
    input: {
      // backgroundColor: "#e0e0e0",
      "&:hover:not($disabled)": {
        // backgroundColor: "#e5e5e5",
      },
    },
    underline: {
      "&:after": {
        border: `2px solid ${theme.palette.primary.main}`,
        left: 0,
        bottom: 0,
        top: 0,
        content: '""',
        position: "absolute",
        right: 0,
        transition: "none",
        transform: "scaleX(0)",
        pointerEvents: "none", // Transparent to the hover style.
      },
      "&:before": {
        display: `none`,
      },
    },
  },
  MuiButton: {
    root: {
      justifyContent: "space-between",
      textTransform: "none",
      // backgroundColor: theme.palette.primary.main,
      maxWidth: "20rem",
      minWidth: "13.75rem",
      height: "3rem",
      // "&:hover": {
      //   backgroundColor: theme.palette.primary.dark,
      // },
    },

    endIcon: {
      marginLeft: ".75rem",
      marginRight: "0",
    },

    text: {
      // color: "white",
      padding: "0 1rem",
    },
  },
  MuiTab: {
    root: {
      textTransform: "none",
      "&:hover": {
        color: "white",
      },
    },
    textColorPrimary: {
      "&$selected": {
        color: "white",
      },
    },
  },
  MuiTabs: {
    indicator: {
      backgroundColor: theme.palette.primary.main,
      height: 1,
    },
  },
  MuiAppBar: {
    colorPrimary: {
      backgroundColor: theme.palette.grey[900],
    },
  },
  MuiStepLabel: {
    label: {
      "&$alternativeLabel": {
        textAlign: "left",
      },
    },
  },
};

export default theme;
