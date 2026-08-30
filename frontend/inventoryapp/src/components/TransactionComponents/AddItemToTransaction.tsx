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

  // useEffect(() => {
  //   handleLineChange(index, "quantity", 1);
  // }, [line.batchId, index]);

  const quantityStep = item.unitOfMeasureAllowsDecimal ? "0.01" : "1";

  const [errorHandler, setErrorHandler] = useState<ErrorHandler>({
    quantity: {
      error: false,
      errorMessage: "",
      maxValue: Number.MAX_SAFE_INTEGER,
      minValue:
        type === "Adjustment" ? Number.MIN_SAFE_INTEGER : Number(quantityStep),
    },
  });

  // Raw typed string for the Quantity field — kept separate from line.quantity
  // so it can hold transient states like "-" while the user is still typing.
  const [rawQuantity, setRawQuantity] = useState<string>(String(line.quantity));

  useEffect(() => {
    const fct = async () => {
      setRawQuantity(String(line.quantity));
    };
    fct();
  }, [line.quantity]);

  const setError = (
    error: boolean,
    errorMessage: string,
    maxValue: number,
    minValue: number,
  ) => {
    setErrorHandler((prev) => ({
      ...prev,
      quantity: { error, errorMessage, maxValue, minValue },
    }));
  };
  const handleQuantityChange = (
    index: number,
    field: keyof CreateTransactionLineDto,
    value: number,
  ) => {
    if (readOnly) return;
    const selectedBatch = batches.find((b) => b.id === line.batchId);
    const stepNum = Number(quantityStep);
    const sumBatchesQuantity = itemBatches.reduce((acc, val) => {
      return acc + val.remainingQuantity;
    }, 0);
    if (!item.unitOfMeasureAllowsDecimal && !Number.isInteger(value)) {
      setError(
        true,
        `Quantity must be a whole number for ${item.unitOfMeasureName}`,
        Number.MAX_SAFE_INTEGER,
        stepNum,
      );
      handleLineChange(index, field, value);
      return;
    }

    if (type === "Purchase") {
      if (value <= 0) {
        setError(
          true,
          "Quantity must be positive",
          Number.MAX_SAFE_INTEGER,
          stepNum,
        );
      } else {
        setError(false, "", Number.MAX_SAFE_INTEGER, stepNum);
      }
      handleLineChange(index, field, value);
      return;
    }

    // Adjustment: can be positive (found extra) or negative (removing stock)
    if (type === "Adjustment") {
      if (value < 0 && !selectedBatch && sumBatchesQuantity < Math.abs(value)) {
        setError(
          true,
          "Quantity removed can't exceed remaining quantity",
          sumBatchesQuantity,
          -sumBatchesQuantity,
        );
      } else if (
        value < 0 &&
        selectedBatch &&
        Math.abs(value) > selectedBatch.remainingQuantity
      ) {
        setError(
          true,
          "Quantity removed can't exceed remaining quantity",
          selectedBatch.remainingQuantity,
          -selectedBatch.remainingQuantity,
        );
      } else {
        setError(false, "", Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
      }
      handleLineChange(index, field, value);
      return;
    }

    if (value <= 0) {
      setError(
        true,
        "Quantity must be positive",
        Number.MAX_SAFE_INTEGER,
        stepNum,
      );
    } else if (selectedBatch && value > selectedBatch.remainingQuantity) {
      setError(
        true,
        "Quantity can't exceed remaining quantity",
        selectedBatch.remainingQuantity,
        stepNum,
      );
    } else if (!selectedBatch && sumBatchesQuantity < Math.abs(value)) {
      setError(
        true,
        `Quantity ${type === "Consumption" ? "used" : "wasted"} can't exceed remaining quantity`,
        sumBatchesQuantity,
        -sumBatchesQuantity,
      );
    } else {
      setError(false, "", Number.MAX_SAFE_INTEGER, stepNum);
    }
    handleLineChange(index, field, value);
  };
  useEffect(() => {
    const fn = async () => {
      handleQuantityChange(index, "quantity", line.quantity);
    };
    fn();
  }, [line.batchId, index]);
  const handleQuantityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (allowedControlKeys.includes(e.key)) return;

    const isDigit = /^[0-9]$/.test(e.key);
    const isMinus = e.key === "-";

    const isDot = e.key === "." && item.unitOfMeasureAllowsDecimal;

    if (!isDigit && !isMinus && !isDot) {
      e.preventDefault();
      return;
    }

    if (isMinus) {
      const isCurrentlyNegative = rawQuantity.startsWith("-");
      e.preventDefault();
      if (
        isCurrentlyNegative ||
        type === "Purchase" ||
        type === "Wasted" ||
        type === "Consumption"
      )
        return;
      setRawQuantity("-");
      return;
    }
  };

  const handleQuantityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRawQuantity(e.target.value);
  };

  const handleQuantityBlur = () => {
    const parsed =
      rawQuantity === "" || rawQuantity === "-" ? 0 : Number(rawQuantity);
    setRawQuantity(String(parsed));
    handleQuantityChange(index, "quantity", parsed);
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
            {item.it_Name} {item.brand ? `(${item.brand})` : ""}
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
            type="text"
            inputMode="decimal"
            value={rawQuantity}
            onKeyDown={handleQuantityKeyDown}
            onChange={handleQuantityInputChange}
            onBlur={handleQuantityBlur}
            error={errorHandler.quantity.error}
            slotProps={{ input: { readOnly } }}
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
                  htmlInput: { min: 0, step: "0.1" },
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
                disabled={itemBatches.length === 0}
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
