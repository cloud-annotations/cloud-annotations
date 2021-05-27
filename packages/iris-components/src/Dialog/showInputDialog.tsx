import React, { useRef } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Input,
} from "@material-ui/core";

import { showDialog } from "./showDialog";

interface Props {
  title: string;
  primary: string;
  onClose: () => any;
  onAction: (value: any) => any;
}

function InputDialog({ title, primary, onClose, onAction }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>

      <DialogContent>
        {/* <DialogContentText id="alert-dialog-description"></DialogContentText> */}
        <Input placeholder="Card Number" inputRef={ref} fullWidth />
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onAction(undefined)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onAction(ref.current?.value)}
          autoFocus
        >
          {primary}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface ConfirmOptions {
  title: string;
  primary: string;
}

export async function showInputDialog(options: ConfirmOptions) {
  return await showDialog<any>(InputDialog, options);
}
