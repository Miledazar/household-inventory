import type { UnitOfMeasure } from "@/interfaces/IUnitOfMeasure";
import { FormControlLabel, Switch, TextField } from "@mui/material";
import { useState } from "react";

interface UnitOfMeasureProps {
  formUnit: UnitOfMeasure;
  mode: string;
  unitOfMeasures: UnitOfMeasure[];
  setFormUnit: React.Dispatch<React.SetStateAction<UnitOfMeasure>>;
}
export function AddEditUnitOfMeasure({
  formUnit,

  mode,
  unitOfMeasures,
  setFormUnit,
}: UnitOfMeasureProps) {
  const [isError, setIsError] = useState(false);
  const handleNameBlur = () => {
    if (
      unitOfMeasures.some(
        (u) =>
          u.name.toLowerCase() === formUnit.name.toLowerCase() &&
          (formUnit.id !== u.id || mode === "add"),
      )
    ) {
      setIsError(true);
    } else {
      setIsError(false);
    }
  };
  return (
    <>
      <TextField
        autoFocus
        label="Name"
        fullWidth
        required
        error={isError}
        value={formUnit.name}
        onChange={(e) =>
          setFormUnit((prev) => ({ ...prev, name: e.target.value }))
        }
        onBlur={handleNameBlur}
        slotProps={{ input: { readOnly: mode === "view" } }}
        sx={{ mb: 2, mt: 1 }}
        helperText={isError ? "Name already used." : ""}
      />
      <FormControlLabel
        control={
          <Switch
            checked={formUnit.allowsDecimal}
            onChange={(e) =>
              setFormUnit((prev) => ({
                ...prev,
                allowsDecimal: e.target.checked,
              }))
            }
            disabled={mode === "view"}
          />
        }
        label="Allows Decimal Quantities"
      />
    </>
  );
}
