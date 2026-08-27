import apiClient from "@/api/client";
import { Button, CircularProgress, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "@/context/SnackbarContext";
import FormDialog from "@/components/Dialog/FormDialog";
import type Brand from "@/interfaces/IBrand";
import SingleFormFields from "@/components/Dialog/SingleFormFields";
import { useLoading } from "@/context/LoadingContext";

type DialogMode = "add" | "edit" | "view";

export default function Brands() {
  const { setIsLoading } = useLoading();
  const { showError, showSuccess } = useSnackbar();

  const [brands, setBrands] = useState<Brand[]>([]);

  //shared dialog state(add/edit/view)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("add");
  const [brandName, setBrandName] = useState("");
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingItem, setIsFetchingItem] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/brands")
      .then((res) => setBrands(res.data))
      .catch(() => showError("Failed to load brands."))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: GridColDef<(typeof brands)[number]>[] = [
    {
      field: "br_Name",
      headerName: "Brand Name",
      flex: 1,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      align: "right",

      renderCell: (params) => {
        return (
          <>
            <IconButton
              color="success"
              onClick={() => handleView(params.row.id)}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => handleEdit(params.row.id)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  // create item
  const handleOpen = () => {
    setMode("add");
    setBrandName("");
    setEditingBrandId(null);
    setDialogOpen(true);
  };

  //view / edit item - fetch the full item the open the dialog in the right mode
  const loadItemIntoDialog = (id: number, targetMode: DialogMode) => {
    setMode(targetMode);
    setBrandName("");
    setDialogOpen(true);
    setEditingBrandId(id);
    setIsFetchingItem(true);
    apiClient
      .get(`/brands/${id}`)
      .then((res) => setBrandName(res.data.br_Name))
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to load item.";
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
    setBrandName("");
    setEditingBrandId(null);
  };

  const handleAddSubmit = () => {
    setIsSubmitting(true);
    apiClient
      .post("/brands", { br_Name: brandName })
      .then((res) => {
        const newBrand = {
          id: res.data.id,
          br_Name: brandName,
        };
        setBrands((prev) => [...prev, newBrand]);
        showSuccess("Brand created successfully.");
        setDialogOpen(false);
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to create brand.";
        showError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleEditSubmit = () => {
    if (editingBrandId === null) return;
    setIsSubmitting(true);
    apiClient
      .put(`/brands/${editingBrandId}`, { br_Name: brandName })
      .then(() => {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === editingBrandId ? { ...b, br_Name: brandName } : b,
          ),
        );
        showSuccess("Brand updated successfully.");
        setDialogOpen(false);
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to update brand.";
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

  // delete item
  const handleDelete = (id: number) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedDeleteId(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (selectedDeleteId === null) return;

    setIsDeleting(true);

    apiClient
      .delete(`brands/${selectedDeleteId}`)
      .then(() => {
        setBrands((prev) => prev.filter((br) => br.id != selectedDeleteId));
        showSuccess("Item deleted succesfully");
        handleCloseDeleteDialog();
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to delete item.";
        showError(message);
      })
      .finally(() => setIsDeleting(false));
  };

  const dialogTitle =
    mode === "add"
      ? "Add New Brand"
      : mode === "edit"
        ? "Edit Brand"
        : "View Brand";
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
          Add New Brand
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          rows={brands}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Add / Edit / View Brand Dialog */}
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
          <SingleFormFields
            name={brandName}
            label="Brand Name"
            onNameChange={setBrandName}
            readOnly={mode === "view"}
          />
        )}
      </FormDialog>

      {/* delete dialog */}
      <FormDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        title="Confirm Delete"
        submitLabel="Delete"
        onSubmit={confirmDelete}
        isSubmitting={isDeleting}
      >
        Are you sure you want to delete this brand? This action cannot be
        undone.
      </FormDialog>
    </Box>
  );
}
