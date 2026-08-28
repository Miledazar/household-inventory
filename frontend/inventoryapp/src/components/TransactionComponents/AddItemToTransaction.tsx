import type { Batche } from "@/interfaces/IBatches";
import type Item from "@/interfaces/IItem";
import type {
  CreateTransactionLineDto,
  TransactionType,
} from "@/interfaces/ITransaction";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

interface AddItemTransactionProps {
  type: TransactionType;
  readOnly: boolean;
  item: Item;
  index: number;
  line: CreateTransactionLineDto;
  batches: Batche[];
  handleRemoveLine: (value: number) => void;
  handleLineChange: <k extends keyof CreateTransactionLineDto>(
    index: number,
    field: k,
    value: CreateTransactionLineDto[k],
  ) => void;
}

interface ErrorHandler {
  [key: string]: {
    error: boolean;
    errorMessage: string;
    maxValue: number;
    minValue: number;
  };
}
export function AddItemToTransaction({
  type,
  readOnly,
  item,
  index,
  line,
  batches,
  handleRemoveLine,
  handleLineChange,
}: AddItemTransactionProps) {
  const lineCreatesNewBatch = useMemo(() => {
    return type === "Purchase" || (type === "Adjustment" && line.quantity > 0);
  }, [type, line.quantity]);

  const itemBatches = useMemo(() => {
    return batches.filter((batch) => batch.itemId == item.id);
  }, [batches, item]);

  useEffect(() => {
    handleLineChange(index, "quantity", Number(1));
  }, [line.batchId, index]);

  const [errorHandler, setErrorHandler] = useState<ErrorHandler>({
    quantity: {
      error: false,
      errorMessage: "",
      maxValue: Number.MAX_SAFE_INTEGER,
      minValue: type === "Adjustment" ? Number.MIN_SAFE_INTEGER : 1,
    },
  });

  const handleQuantityChange = (
    index: number,
    field: keyof CreateTransactionLineDto,
    value: number,
  ) => {
    const selectedBatch = batches.find((b) => b.id === line.batchId)!;

    if (!selectedBatch) {
      if (type === "Adjustment" && value <= 0) {
        setErrorHandler((prev) => ({
          ...prev,
          quantity: {
            error: false,
            errorMessage: "",
            maxValue: Number.MAX_SAFE_INTEGER,
            minValue: Number.MIN_SAFE_INTEGER,
          },
        }));
        handleLineChange(index, field, Number(value));
        return;
      }
      if (type === "Consumption" || type === "Wasted") {
        setErrorHandler((prev) => ({
          ...prev,
          quantity: {
            error: false,
            errorMessage: "",
            maxValue: Number.MAX_SAFE_INTEGER,
            minValue: 1,
          },
        }));
        handleLineChange(index, field, Number(value));
        return;
      }
    }

    if (type === "Purchase") {
      if (value <= 0) {
        setErrorHandler((prev) => ({
          ...prev,
          quantity: {
            error: true,
            errorMessage: "Quantity must be positive",
            maxValue: Number.MAX_SAFE_INTEGER,
            minValue: 1,
          },
        }));
      } else {
        setErrorHandler((prev) => ({
          ...prev,
          quantity: {
            error: false,
            errorMessage: "",
            maxValue: Number.MAX_SAFE_INTEGER,
            minValue: 1,
          },
        }));
      }
      handleLineChange(index, field, Number(value));
      return;
    }
    if (type !== "Adjustment" && Number(value) <= 0) {
      setErrorHandler((prev) => ({
        ...prev,
        quantity: {
          error: true,
          errorMessage: "Quantity must be postivie",
          maxValue: prev.quantity.maxValue,
          minValue: 1,
        },
      }));
    } else if (
      type === "Adjustment" &&
      value < 0 &&
      Math.abs(value) > selectedBatch.remainingQuantity
    ) {
      setErrorHandler((prev) => ({
        ...prev,
        quantity: {
          error: true,
          errorMessage:
            "Quantity removed can't be Higher then current quantity",
          maxValue: selectedBatch.remainingQuantity,
          minValue: -selectedBatch.remainingQuantity,
        },
      }));
    } else if (
      (type === "Consumption" || type === "Wasted") &&
      value > selectedBatch.remainingQuantity
    ) {
      setErrorHandler((prev) => ({
        ...prev,
        quantity: {
          error: true,
          errorMessage: "Quantity can't be Higher then current quantity",
          maxValue: selectedBatch.remainingQuantity,
          minValue: 1,
        },
      }));
    } else {
      setErrorHandler((prev) => ({
        ...prev,
        quantity: {
          error: false,
          errorMessage: "",
          maxValue: prev.quantity.maxValue,
          minValue: prev.quantity.minValue,
        },
      }));
    }
    handleLineChange(index, field, Number(value));
  };

  const handleBatchChange = (
    index: number,
    field: keyof CreateTransactionLineDto,
    value: number | null,
  ) => {
    if (value === null) {
      setErrorHandler((prev) => ({
        ...prev,
        quantity: {
          error: false,
          errorMessage: "",
          maxValue: item.currentQuantity,
          minValue: 1,
        },
      }));
      handleLineChange(index, field, value);
      return;
    }
    const selectedBatch = batches.find((b) => b.id === value);
    if (!selectedBatch) return;
    setErrorHandler((prev) => ({
      ...prev,
      quantity: {
        error: false,
        errorMessage: "",
        maxValue: selectedBatch.remainingQuantity,
        minValue: prev.quantity.minValue,
      },
    }));
    handleLineChange(index, field, Number(value));
  };
  return (
    <Stack spacing={2.5} sx={{ mb: 1 }}>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {item.it_Name}
          </Typography>
          {!readOnly && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRemoveLine(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Quantity"
            type="number"
            value={line.quantity}
            onChange={(e) =>
              handleQuantityChange(index, "quantity", Number(e.target.value))
            }
            error={errorHandler.quantity.error}
            slotProps={{
              input: { readOnly },
              htmlInput: {
                max: errorHandler.quantity.maxValue,
                min: errorHandler.quantity.minValue,
              },
            }}
            required
            sx={{ flex: 1 }}
            helperText={errorHandler.quantity.errorMessage}
          />

          {lineCreatesNewBatch && (
            <>
              <TextField
                label="Unit Price"
                type="number"
                value={line.unitPrice ?? ""}
                onChange={(e) =>
                  handleLineChange(
                    index,
                    "unitPrice",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                slotProps={{
                  input: { readOnly },
                  htmlInput: { min: 0 },
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Expiration Date (optional)"
                type="date"
                value={line.expirationDate?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  handleLineChange(
                    index,
                    "expirationDate",
                    e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  )
                }
                slotProps={{
                  input: { readOnly },
                  inputLabel: { shrink: true },
                }}
                sx={{ flex: 3 }}
              />
            </>
          )}

          {!lineCreatesNewBatch &&
            (readOnly ? (
              <Box sx={{ flex: 2, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {line.batchId
                    ? `Batch #${line.batchId}${
                        line.expirationDate
                          ? ` — expires ${new Date(line.expirationDate).toLocaleDateString()}`
                          : ""
                      }`
                    : "Auto (Oldest batch first)"}
                </Typography>
              </Box>
            ) : (
              <TextField
                select
                label="Batch (optional — default: oldest first)"
                value={line.batchId ?? ""}
                onChange={(e) =>
                  handleBatchChange(
                    index,
                    "batchId",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                slotProps={{ input: { readOnly } }}
                disabled={!itemBatches}
                sx={{ flex: 2 }}
              >
                <MenuItem value="">Auto (Oldest Batch first)</MenuItem>
                {itemBatches.map((batch) => (
                  <MenuItem key={batch.id} value={batch.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: 2,
                      }}
                    >
                      <Typography variant="body2">
                        Qty: <strong>{batch.remainingQuantity}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.expirationDate
                          ? `Expires ${new Date(batch.expirationDate).toLocaleDateString()}`
                          : batch.purchaseDate
                            ? `Added ${new Date(batch.purchaseDate).toLocaleDateString()}`
                            : "No expiry"}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            ))}
        </Stack>
      </Box>
    </Stack>
  );
}
