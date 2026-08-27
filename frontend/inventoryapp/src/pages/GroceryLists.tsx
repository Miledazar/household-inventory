import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import apiClient from "@/api/client";
import { useEffect, useState } from "react";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type Grocery from "@/interfaces/IGrocery";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import FormDialog from "@/components/Dialog/FormDialog";

export default function GroceryLists() {
  const { setIsLoading } = useLoading();
  const { showError, showSuccess } = useSnackbar();
  const navigate = useNavigate();

  const [groceries, setGroceries] = useState<Grocery[]>([]);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/grocerylists")
      .then((res) => setGroceries(res.data))
      .catch(() => showError("Failed to load Grocery Lists"))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: GridColDef<(typeof groceries)[number]>[] = [
    { field: "gr_Name", headerName: "Grocery List Name", flex: 1 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => navigate(`/grocery-lists/${params.row.id}`)}
          >
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // Create
  const handleOpenCreate = () => {
    setNewListName("");
    setCreateOpen(true);
  };

  const handleCreateSubmit = () => {
    setIsSubmitting(true);
    apiClient
      .post("/grocerylists", { name: newListName || null })
      .then((res) => {
        showSuccess("Grocery list created successfully.");
        setCreateOpen(false);
        navigate(`/grocery-lists/${res.data.id}`);
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to create list.";
        showError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  // Generate
  const handleGenerate = () => {
    apiClient
      .post("/grocerylists/generate")
      .then((res) => {
        showSuccess("Grocery list generated from low-stock items.");
        navigate(`/grocery-lists/${res.data.id}`);
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to generate list.";
        showError(message);
      });
  };

  // Delete
  const handleDelete = (id: number) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDeleteId(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (selectedDeleteId === null) return;
    setIsDeleting(true);
    apiClient
      .delete(`/grocerylists/${selectedDeleteId}`)
      .then(() => {
        setGroceries((prev) => prev.filter((g) => g.id !== selectedDeleteId));
        showSuccess("Grocery list deleted successfully.");
        handleCloseDeleteDialog();
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to delete list.";
        showError(message);
      })
      .finally(() => setIsDeleting(false));
  };

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
          onClick={handleGenerate}
          sx={{ mr: 2 }}
        >
          Generate List
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Create List
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          rows={groceries}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>

      <FormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Grocery List"
        onSubmit={handleCreateSubmit}
        submitLabel="Create"
        isSubmitting={isSubmitting}
      >
        <TextField
          autoFocus
          label="List Name (optional)"
          fullWidth
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          sx={{ mt: 1 }}
        />
      </FormDialog>

      <FormDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        title="Confirm Delete"
        submitLabel="Delete"
        onSubmit={confirmDelete}
        isSubmitting={isDeleting}
      >
        Are you sure you want to delete this grocery list? This action cannot be
        undone.
      </FormDialog>
    </Box>
  );
}
