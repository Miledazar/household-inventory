import apiClient from "@/api/client";
import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type Transaction from "@/interfaces/ITransaction";
import type { CreateTransactionDto } from "@/interfaces/ITransaction";
import FormDialog from "@/components/Dialog/FormDialog";
import { AddTransaction } from "@/components/TransactionComponents/AddTransaction";
import { useLocation } from "react-router-dom";

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
  const [viewData, setViewData] = useState<CreateTransactionDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingTransaction, setIsFetchingTransaction] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/transactions")
      .then((res) => setTransactions(res.data))
      .catch(() => showError("Failed to load transactions"))
      .finally(() => setIsLoading(false));
  }, []);

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

  const handleAddSubmit = () => {
    setIsSubmitting(true);
    apiClient
      .post("/transactions", transactionForm)
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
