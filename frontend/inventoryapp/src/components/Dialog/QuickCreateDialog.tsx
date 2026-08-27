// src/components/Dialog/QuickCreateDialog.tsx
import { useState, type ReactNode } from "react";
import FormDialog from "./FormDialog";
import apiClient from "@/api/client";
import axios from "axios";
import { useSnackbar } from "@/context/SnackbarContext";

interface QuickCreateDialogProps<T extends object> {
  open: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  initialValue: T;
  successMessage: string;
  onCreated: (created: T) => void;
  renderFields: (
    value: T,
    onChange: <K extends keyof T>(field: K, value: T[K]) => void,
  ) => ReactNode;
}

export function QuickCreateDialog<T extends object>({
  open,
  onClose,
  title,
  endpoint,
  initialValue,
  successMessage,
  onCreated,
  renderFields,
}: QuickCreateDialogProps<T>) {
  const { showError, showSuccess } = useSnackbar();
  const [value, setValue] = useState<T>(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = <K extends keyof T>(field: K, newVal: T[K]) => {
    setValue((prev) => ({ ...prev, [field]: newVal }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiClient.post(endpoint, value);
      const fullResult = { ...value, id: res.data.id };
      onCreated(fullResult);
      showSuccess(successMessage);
      setValue(initialValue);
      onClose();
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data === "string"
          ? err.response.data
          : "Failed to create.";
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setValue(initialValue);
    onClose();
  };

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title={title}
      onSubmit={handleSubmit}
      submitLabel="Create"
      isSubmitting={isSubmitting}
    >
      {renderFields(value, handleChange)}
    </FormDialog>
  );
}
