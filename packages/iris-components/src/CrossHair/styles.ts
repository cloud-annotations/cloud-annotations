/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createStyles, makeStyles } from "@material-ui/core";

interface Props {
  color?: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    base: {
      visibility: "hidden",
      position: "absolute",
      pointerEvents: "none",
      zIndex: 2,
    },
    primary: { fill: (props: Props) => props.color },
    shadow: { fill: "rgba(255, 255, 255, 0.2)" },
    border: { fill: "rgba(255, 255, 255, 0.5)" },
  })
);

export default useStyles;
