/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { SvgIcon, SvgIconProps } from "@material-ui/core";

function Tooltip(props: SvgIconProps) {
  return (
    <SvgIcon viewBox="0 0 32 32" {...props}>
      <polygon points="17 22 17 13 13 13 13 15 15 15 15 22 12 22 12 24 20 24 20 22 17 22" />
      <path d="M16,7a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,7Z" />
      <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
    </SvgIcon>
  );
}

export default Tooltip;
