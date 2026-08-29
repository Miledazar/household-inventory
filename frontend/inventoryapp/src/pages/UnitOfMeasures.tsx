import apiClient from "@/api/client";
import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "@/context/SnackbarContext";
import FormDialog from "@/components/Dialog/FormDialog";
import { useLoading } from "@/context/LoadingContext";
import type { UnitOfMeasure } from "@/interfaces/IUnitOfMeasure";
import axios from "axios";

import { AddEditUnitOfMeasure } from "@/components/UnitOfMeasure/AddEditUnitOfMeasure";

type DialogMode = "add" | "edit" | "view";

const emptyUnit: UnitOfMeasure = { id: 0, name: "", allowsDecimal: false };

export default function UnitOfMeasures() {
  const { setIsLoading } = useLoading();
  const { showError, showSuccess } = useSnackbar();

  const [unitOfMeasures, setUnitOfMeasures] = useState<UnitOfMeasure[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("add");
  const [formUnit, setFormUnit] = useState<UnitOfMeasure>(emptyUnit);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingItem, setIsFetchingItem] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const fetchUnits = () => {
    setIsLoading(true);
    apiClient
      .get("/unitofmeasures")
      .then((res) => setUnitOfMeasures(res.data))
      .catch(() => showError("Failed to load units of measure."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const columns: GridColDef<(typeof unitOfMeasures)[number]>[] = [
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "allowsDecimal",
      headerName: "Allows Decimal",
      flex: 1,
      renderCell: (params) => (params.value ? "Yes" : "No"),
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
        <>
          <IconButton color="success" onClick={() => handleView(params.row.id)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
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
  const handleOpen = () => {
    setMode("add");
    setFormUnit(emptyUnit);
    setEditingId(null);
    setDialogOpen(true);
  };

  // View / Edit — fetch the real record, then open the dialog
  const loadItemIntoDialog = (id: number, targetMode: DialogMode) => {
    setMode(targetMode);
    setFormUnit(emptyUnit);
    setEditingId(id);
    setDialogOpen(true);
    setIsFetchingItem(true);
    apiClient
      .get(`/unitofmeasures/${id}`)
      .then((res) => setFormUnit(res.data))
      .catch((err: unknown) => {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to load unit of measure.";
        showError(message);
        setDialogOpen(false);
      })
      .finally(() => setIsFetchingItem(false));
  };

  const handleView = (id: number) => loadItemIntoDialog(id, "view");
  const handleEdit = (id: number) => loadItemIntoDialog(id, "edit");

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setFormUnit(emptyUnit);
    setEditingId(null);
  };

  const handleAddSubmit = () => {
    setIsSubmitting(true);
    apiClient
      .post("/unitofmeasures", {
        name: formUnit.name,
        allowsDecimal: formUnit.allowsDecimal,
      })
      .then((res) => {
        const created: UnitOfMeasure = {
          id: res.data.id,
          name: formUnit.name,
          allowsDecimal: formUnit.allowsDecimal,
        };
        setUnitOfMeasures((prev) => [...prev, created]);
        showSuccess("Unit of measure created successfully.");
        setDialogOpen(false);
      })
      .catch((err: unknown) => {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to create unit of measure.";
        showError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleEditSubmit = () => {
    if (editingId === null) return;
    setIsSubmitting(true);
    apiClient
      .put(`/unitofmeasures/${editingId}`, {
        name: formUnit.name,
        allowsDecimal: formUnit.allowsDecimal,
      })
      .then(() => {
        setUnitOfMeasures((prev) =>
          prev.map((u) =>
            u.id === editingId
              ? {
                  ...u,
                  name: formUnit.name,
                  allowsDecimal: formUnit.allowsDecimal,
                }
              : u,
          ),
        );
        showSuccess("Unit of measure updated successfully.");
        setDialogOpen(false);
      })
      .catch((err: unknown) => {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to update unit of measure.";
        showError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleSubmit = () => {
    if (mode === "view") {
      setDialogOpen(false);
      return;
    }
    if (mode === "add") handleAddSubmit();
    if (mode === "edit") handleEditSubmit();
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
      .delete(`/unitofmeasures/${selectedDeleteId}`)
      .then(() => {
        setUnitOfMeasures((prev) =>
          prev.filter((u) => u.id !== selectedDeleteId),
        );
        showSuccess("Unit of measure deleted successfully.");
        handleCloseDeleteDialog();
      })
      .catch((err: unknown) => {
        const message =
          axios.isAxiosError(err) && typeof err.response?.data === "string"
            ? err.response.data
            : "Failed to delete unit of measure.";
        showError(message);
      })
      .finally(() => setIsDeleting(false));
  };

  const dialogTitle =
    mode === "add"
      ? "Add New Unit of Measure"
      : mode === "edit"
        ? "Edit Unit of Measure"
        : "View Unit of Measure";
  const submitLabel =
    mode === "add" ? "Add" : mode === "edit" ? "Save" : "Close";

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
          Add New Unit of Measure
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          rows={unitOfMeasures}
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
        {isFetchingItem ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AddEditUnitOfMeasure
            formUnit={formUnit}
            mode={mode}
            setFormUnit={setFormUnit}
            unitOfMeasures={unitOfMeasures}
          />
        )}
      </FormDialog>

      <FormDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        title="Confirm Delete"
        submitLabel="Delete"
        onSubmit={confirmDelete}
        isSubmitting={isDeleting}
      >
        Are you sure you want to delete this unit of measure? This action cannot
        be undone.
      </FormDialog>
    </Box>
  );
}
