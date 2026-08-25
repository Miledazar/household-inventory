import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { ReactNode } from "react";

interface FormDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSubmit: () => void;
    submitLabel: string;
    isSubmitting?: boolean;
    isViewOnly?: boolean
}

export default function FormDialog({open, onClose, title, children, onSubmit, submitLabel, isSubmitting = false, isViewOnly = false}:FormDialogProps){
    return (
        <Dialog open={open} maxWidth = "sm" fullWidth>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                {isViewOnly?
                <Button onClick={onSubmit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : submitLabel}
                </Button> :
                <>
                <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
                    Cancel
                </Button>  
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : submitLabel}
                </Button>
                </>}
            </DialogActions>
            </form>
        </Dialog>
    );
}