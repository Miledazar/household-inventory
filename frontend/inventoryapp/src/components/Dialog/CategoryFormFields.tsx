import { TextField } from "@mui/material";

interface CategoryFormFieldsProps {
    name: string;
    description: string;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    readOnly?: boolean;
}

export default function CategoryFormFields({name, description, onNameChange, onDescriptionChange, readOnly = false } : CategoryFormFieldsProps){
    return(
    <>
        <TextField
        autoFocus={!readOnly}
        label="Category Name"
        fullWidth
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        slotProps={{ input: { readOnly } }}
        sx={{ mb: 2, mt: 1 }}
        />
        <TextField
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        slotProps={{ input: { readOnly } }}
        />
    </>
    );
}