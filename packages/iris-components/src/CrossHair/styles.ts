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
