import { TextField } from "@mui/material";

interface SingleFormFieldsProps {
    label: string;
    name: string;
    onNameChange: (value: string) => void;
    readOnly?: boolean;
}

export default function SingleFormFields({label, name, onNameChange, readOnly = false}:SingleFormFieldsProps){
    return (
      <TextField
        autoFocus={!readOnly}
        label={label}
        fullWidth
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        slotProps={{ input: { readOnly } }}
        sx={{ mb: 2, mt: 1 }}
        />
    );
}