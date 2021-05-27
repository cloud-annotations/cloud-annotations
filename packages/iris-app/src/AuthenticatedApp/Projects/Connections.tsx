import React from "react";

import {
  Button,
  createStyles,
  makeStyles,
  SvgIcon,
  SvgIconProps,
  Theme,
} from "@material-ui/core";
import { useHistory, useParams } from "react-router-dom";
import { mutate } from "swr";

import { api, endpoint } from "@iris/api";
import { showInputDialog } from "@iris/components";

function CreateIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <polygon points="17,15 17,8 15,8 15,15 8,15 8,17 15,17 15,24 17,24 17,17 24,17 24,15 " />
    </SvgIcon>
  );
}

function COSIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <path d="M28,20H26v2h2v6H4V22H14V20H4a2.0023,2.0023,0,0,0-2,2v6a2.0023,2.0023,0,0,0,2,2H28a2.0023,2.0023,0,0,0,2-2V22A2.0023,2.0023,0,0,0,28,20Z" />
      <circle cx="7" cy="25" r="1" />
      <path d="M30,8H22v6H16v8h8V16h6ZM22,20H18V16h4Zm6-6H24V10h4Z" />
      <path d="M18,10H10V2h8ZM12,8h4V4H12Z" />
    </SvgIcon>
  );
}

function FileSystemIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <rect x="14" y="19" width="4" height="2" />
      <path d="M6,2V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V2ZM24,28H8V16H24Zm0-14H8V10H24ZM8,8V4H24V8Z" />
    </SvgIcon>
  );
}

function ConnectionIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <path
        d="M23,16a7,7,0,0,0-4.18,1.39L14.6,13.17A6.86,6.86,0,0,0,16,9a7,7,0,1,0-2.81,5.59l4.21,4.22A7,7,0,1,0,23,16ZM4,9a5,5,0,1,1,5,5A5,5,0,0,1,4,9Z"
        transform="translate(0 0.01)"
      />
    </SvgIcon>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      paddingTop: 8,
      backgroundColor: "var(--secondaryBg)",
      display: "flex",
      flexDirection: "column",
    },
    item: {
      cursor: "pointer",
      height: 40,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      borderLeft: `4px solid transparent`,
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.03)",
      },
    },
    icon: {
      // width: 20,
      // height: 20,
      marginRight: 20,
      fill: "white",
      flexShrink: 0,
      "& .MuiSvgIcon-root": {
        fontSize: 20,
      },
    },
    text: {
      lineHeight: "18px",
      whiteSpace: "nowrap",
      overflowX: "hidden",
      textOverflow: "ellipsis",
    },
    selected: {
      // backgroundColor: "rgba(255, 255, 255, 0.08) !important",
      backgroundColor: "rgba(255, 255, 255, 0.06) !important",

      borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
    buttonGroup1: {
      width: "100%",
      padding: "12px",
      // marginBottom: "auto",
    },
    buttonGroup: {
      width: "100%",
      marginTop: "auto",
      marginBottom: 8,
      padding: 12,
      // marginBottom: "auto",
      "& $button": {
        color: "#78a9ff",
        // border: "1px solid rgba(255, 255, 255, 0.08)",
      },
    },
    button: {
      minWidth: "100%",
      // marginBottom: 16,
    },
    divider: {
      height: 1,
      backgroundColor: "rgba(111, 111, 111, 0.16)",
      width: "100%",
      margin: "8px 0",
    },
  })
);

function Connections({ connections }: any) {
  const classes = useStyles();

  const history = useHistory();
  const params = useParams<any>();

  return (
    <div className={classes.root}>
      <div className={classes.buttonGroup1}>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={async () => {
            const x = await showInputDialog({
              title: "Bloop",
              primary: "Mkay",
            });
            if (x !== undefined && x.trim() !== "") {
              await api.post("/projects", {
                query: {
                  providerID: params.providerID,
                  connectionID: params.connectionID,
                  name: x,
                },
              });
              mutate(
                endpoint("/projects", {
                  query: {
                    providerID: params.providerID,
                    connectionID: params.connectionID,
                  },
                })
              );
            }
          }}
        >
          New project
        </Button>
      </div>
      <div className={classes.divider} />
      {connections.map((connection: any) => (
        <div
          onClick={() => {
            history.replace(
              `/projects/${connection.providerID}/${connection.id}`
            );
          }}
          className={
            classes.item +
            " " +
            (connection.id === params.connectionID ? classes.selected : "")
          }
        >
          <div className={classes.icon}>
            {connection.icon !== undefined ? (
              <img
                alt=""
                height="20px"
                src={`data:image/svg+xml;utf8,${connection.icon}`}
              />
            ) : (
              <ConnectionIcon />
            )}
          </div>
          <div className={classes.text}>{connection.name}</div>
        </div>
      ))}
      <div className={classes.buttonGroup}>
        {/* <Button
          className={classes.button}
          variant="outlined"
          // variant="contained"
          // color="secondary"
          endIcon={<CreateIcon />}
          onClick={async () => {
            await showConfirmDialog({ title: "Bloop", primary: "Mkay" });
          }}
        >
          Add a connection
        </Button> */}
      </div>
    </div>
  );
}

export default Connections;
