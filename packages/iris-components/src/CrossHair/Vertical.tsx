import React from "react";

import useStyles from "./styles";

interface Props {
  color?: string;
}

const Vertical = React.forwardRef<SVGSVGElement, Props>(({ color }, ref) => {
  const classes = useStyles({ color });
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 2 1"
      className={classes.base}
      ref={ref}
    >
      <rect x="0" y="0" width="1" height="1" className={classes.primary} />
      <rect x="1" y="0" width="1" height="1" className={classes.shadow} />
    </svg>
  );
});

export default Vertical;
