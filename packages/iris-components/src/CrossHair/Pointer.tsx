/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import useStyles from "./styles";

interface Props {
  color?: string;
}

const Pointer = React.forwardRef<SVGSVGElement, Props>(({ color }, ref) => {
  const classes = useStyles({ color });
  return (
    <svg viewBox="0 0 38 38" ref={ref} className={classes.base}>
      <g className={classes.border}>
        <rect x="0" y="16" width="14" height="6" rx="3" />
        <rect x="24" y="16" width="14" height="6" rx="3" />
        <rect x="16" y="0" width="6" height="14" rx="3" />
        <rect x="16" y="24" width="6" height="14" rx="3" />
        <rect x="16" y="16" width="6" height="6" rx="3" />
      </g>

      <g className={classes.primary}>
        <rect x="2" y="18" width="10" height="2" />
        <rect x="26" y="18" width="10" height="2" />
        <rect x="18" y="2" width="2" height="10" />
        <rect x="18" y="26" width="2" height="10" />
        <rect x="18" y="18" width="2" height="2" />
      </g>
    </svg>
  );
});

export default Pointer;
