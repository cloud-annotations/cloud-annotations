/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { SvgIcon, SvgIconProps } from "@material-ui/core";

export function IrisLogo(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 40 41" {...props}>
      <rect fill="white" x="0" y="0" width="8" height="8" />
      <rect fill="white" x="32" y="0" width="8" height="8" />
      <rect fill="white" x="0" y="33" width="8" height="8" />
      <rect fill="white" x="32" y="33" width="8" height="8" />
      <rect fill="white" x="4" y="8" width="4" height="25" />
      <rect fill="white" x="32" y="8" width="4" height="25" />
      <rect fill="white" x="8" y="5" width="24" height="3" />
      <rect fill="white" x="8" y="33" width="24" height="3" />
    </SvgIcon>
  );
}
