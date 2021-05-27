/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import useStyles from "./styles";

interface Props {
  color?: string;
}

const Horizontal = React.forwardRef<SVGSVGElement, Props>(({ color }, ref) => {
  const classes = useStyles({ color });
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 1 2"
      className={classes.base}
      ref={ref}
    >
      <rect x="0" y="0" width="1" height="1" className={classes.primary} />
      <rect x="0" y="1" width="1" height="1" className={classes.shadow} />
    </svg>
  );
});

export default Horizontal;
