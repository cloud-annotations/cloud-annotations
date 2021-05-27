/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from "react";

const HorizontalListItem = React.memo(
  ({ onItemSelected, state, listItem, index, id }) => {
    const handleClick = useCallback(
      (e) => {
        onItemSelected(e, index);
      },
      [index, onItemSelected]
    );
    return (
      <div id={id} onClick={handleClick}>
        {React.cloneElement(listItem, {
          state: state,
        })}
      </div>
    );
  }
);

export default HorizontalListItem;
