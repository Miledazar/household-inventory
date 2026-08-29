import apiClient from "@/api/client";
import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type Transaction from "@/interfaces/ITransaction";
import type {
  CreateTransactionDto,
  CreateTransactionLineDto,
} from "@/interfaces/ITransaction";
import FormDialog from "@/components/Dialog/FormDialog";
import { AddTransaction } from "@/components/TransactionComponents/AddTransaction";
import { useLocation } from "react-router-dom";
import type { Batche } from "@/interfaces/IBatches";

const emptyTransaction: CreateTransactionDto = {
  type: "Purchase",
  date: new Date().toISOString(),
  notes: "",
  storeId: null,
  groceryListId: null,
  lines: [],
};

type DialogMode = "add" | "view";

export default function Transactions() {
  const location = useLocation();

  const { setIsLoading } = useLoading();
  const { showError, showSuccess } = useSnackbar();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("add");
  const [transactionForm, setTransactionForm] =
    useState<CreateTransactionDto>(emptyTransaction);
  const [batches, setBatches] = useState<Batche[]>([]);
  const [viewData, setViewData] = useState<CreateTransactionDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingTransaction, setIsFetchingTransaction] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.get("/transactions"),
      apiClient.get("/Items/batches"),
    ])
      .then(([resTransactions, resBatches]) => {
        setTransactions(resTransactions.data);
        setBatches(resBatches.data);
      })

      .catch(() => showError("Failed to load transactions"))
      .finally(() => setIsLoading(false));
  }, []);
  useEffect(() => {
    apiClient
      .get("/Items/batches")
      .then((res) => {
        setBatches(res.data);
      })

      .catch(() => showError("Failed to load Batches"));
  }, [transactionForm]);

  useEffect(() => {
    const fct = async () => {
      const draft = location.state?.prefilledDraft;
      if (draft) {
        setTransactionForm(draft);
        setMode("add");
        setDialogOpen(true);
      }
    };
    fct();
  }, [location.state]);

  const TRANSACTION_TYPE_LABELS: Record<string, string> = {
    Purchase: "Purchase",
    Consumption: "Used",
    Adjustment: "Adjustment",
    Wasted: "Wasted",
  };

  const columns: GridColDef<(typeof transactions)[number]>[] = [
    {
      field: "type",
      headerName: "Transaction Type",
      flex: 1,
      valueFormatter: (value: string) => TRANSACTION_TYPE_LABELS[value],
    },
    {
      field: "date",
      headerName: "Transaction Date",
      flex: 1,
      valueFormatter: (value: string) =>
        value
          ? new Date(value).toLocaleString("en-US", { dateStyle: "medium" })
          : "",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <IconButton color="success" onClick={() => handleView(params.row.id)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const handleOpen = () => {
    setMode("add");
    setTransactionForm(emptyTransaction);
    setDialogOpen(true);
  };

  const handleView = (id: number) => {
    setMode("view");
    setViewData(null);
    setDialogOpen(true);
    setIsFetchingTransaction(true);

    Promise.all([
      apiClient.get(`/transactions/${id}`),
      apiClient.get(`/transactions/${id}/lines`),
    ])
      .then(([txRes, linesRes]) => {
        const tx: Transaction = txRes.data;
        setViewData({
          type: tx.type,
          date: tx.date,
          notes: tx.notes,
          storeId: tx.storeId,
          groceryListId: tx.groceryListId,
          lines: linesRes.data,
        });
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to load transaction.";
        showError(message);
        setDialogOpen(false);
      })
      .finally(() => setIsFetchingTransaction(false));
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
  };

  const handleFormChange = <K extends keyof CreateTransactionDto>(
    field: K,
    value: CreateTransactionDto[K],
  ) => {
    setTransactionForm((prev) => ({ ...prev, [field]: value }));
  };
  function resolveLinesWithFifo(
    batches: Batche[],
    type: string,
  ): CreateTransactionLineDto[] {
    const resolvedLines: CreateTransactionLineDto[] = [];

    const consumedSoFar: Record<number, number> = {};

    transactionForm.lines.forEach((line) => {
      if (line.batchId || (line.quantity > 0 && type === "Adjustment")) {
        resolvedLines.push(line);
        return;
      }

      const itemBatches = batches
        .filter(
          (b) =>
            b.itemId === line.itemId &&
            b.remainingQuantity > (consumedSoFar[b.id] ?? 0),
        )
        .sort(
          (a, b) =>
            new Date(a.purchaseDate).getTime() -
            new Date(b.purchaseDate).getTime(),
        );

      let remainingNeeded = Math.abs(line.quantity);

      for (const batch of itemBatches) {
        if (remainingNeeded <= 0) break;

        const alreadyConsumed = consumedSoFar[batch.id] ?? 0;
        const availableInBatch = batch.remainingQuantity - alreadyConsumed;
        const takeFromThisBatch = Math.min(availableInBatch, remainingNeeded);

        if (takeFromThisBatch <= 0) continue;

        resolvedLines.push({
          ...line,
          quantity: line.quantity < 0 ? -takeFromThisBatch : takeFromThisBatch,
          batchId: batch.id,
        });

        consumedSoFar[batch.id] = alreadyConsumed + takeFromThisBatch;
        remainingNeeded -= takeFromThisBatch;
      }

      if (remainingNeeded > 0) {
        throw new Error(
          `Not enough stock for item ${line.itemId} — short by ${remainingNeeded}.`,
        );
      }
    });

    return resolvedLines;
  }
  const handleAddSubmit = () => {
    setIsSubmitting(true);

    let payload = transactionForm;

    if (
      transactionForm.type === "Consumption" ||
      transactionForm.type === "Wasted" ||
      transactionForm.type === "Adjustment"
    ) {
      try {
        const resolvedLines = resolveLinesWithFifo(
          batches,
          transactionForm.type,
        );
        payload = { ...transactionForm, lines: resolvedLines };
        setTransactionForm(payload);
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "Failed to resolve batches.",
        );
        setIsSubmitting(false);
        return;
      }
    }

    apiClient
      .post("/transactions", payload)
      .then(() => {
        showSuccess("Transaction created successfully.");
        setDialogOpen(false);
        return apiClient.get("/transactions");
      })
      .then((res) => setTransactions(res.data))
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to create transaction.";
        showError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleSubmit = () => {
    if (mode === "view") {
      setDialogOpen(false);
      return;
    }
    handleAddSubmit();
  };

  const dialogTitle =
    mode === "add" ? "Create Transaction" : "View Transaction";
  const submitLabel = mode === "add" ? "Add" : "Close";

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Create Transaction
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          rows={transactions}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>

      <FormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        title={dialogTitle}
        onSubmit={handleSubmit}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        isViewOnly={mode === "view"}
      >
        {isFetchingTransaction ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : mode === "add" ? (
          <AddTransaction
            transaction={transactionForm}
            onChange={handleFormChange}
          />
        ) : (
          viewData && (
            <AddTransaction
              transaction={viewData}
              onChange={() => {}}
              readOnly
            />
          )
        )}
      </FormDialog>
    </Box>
  );
}
