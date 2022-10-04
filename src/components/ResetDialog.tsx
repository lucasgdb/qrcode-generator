import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface Props {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
}

export function ResetDialog({ open, onClose, onConfirm }: Props) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-description"
    >
      <DialogTitle id="reset-dialog-title">Resetar</DialogTitle>

      <DialogContent>
        <DialogContentText id="reset-dialog-description">
          Deseja resetar o QRCode para seu estado original?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Não</Button>
        <Button onClick={handleConfirm} autoFocus>
          Sim
        </Button>
      </DialogActions>
    </Dialog>
  );
}
