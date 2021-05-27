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
