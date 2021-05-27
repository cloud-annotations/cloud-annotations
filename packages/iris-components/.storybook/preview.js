import React from "react";
import { ThemeProvider, CssBaseline } from "@material-ui/core";
import theme from "@iris/theme";

export const decorators = [
  (Story) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  ),
];
