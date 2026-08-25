import type Item from "@/interfaces/IItem";
import { Box, Button, Chip, CircularProgress, IconButton } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useLoading } from "@/context/LoadingContext";
import apiClient from "@/api/client";
import { useSnackbar } from "@/context/SnackbarContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArchiveIcon from "@mui/icons-material/Archive";
import FormDialog from "@/components/Dialog/FormDialog";
import { AddEditItem } from "@/components/ItemComponents/AddEditItem";

const emptyItem: Item = {
  id: 0,
  it_Name: "",
  category_Id: null,
  brand_Id: null,
  threshold: 0,
  currentQuantity: 0,
  flag: false,
  unitOfMeasure: "",
  isActive: true,
  notes: "",
};

type DialogMode = "add" | "edit" | "view";

export default function Items() {
  const { setIsLoading } = useLoading();
  const { showError, showSuccess } = useSnackbar();

  const [items, setItems] = useState<Item[]>([]);

  // Shared dialog state (add/edit/view)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("add");
  const [formItem, setFormItem] = useState<Item>(emptyItem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingItem, setIsFetchingItem] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/items")
      .then((res) => setItems(res.data))
      .catch(() => showError("Failed to load items."))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: GridColDef<(typeof items)[number]>[] = [
    {
      field: "warning",
      headerName: "",
      width: 10,
      sortable: false,
      filterable: false,
      headerAlign: "right",
      disableColumnMenu: true,
      align: "right",
      renderCell: (params) => {
        const isLessThanThreshold =
          params.row.currentQuantity! < params.row.threshold;
        return (
          <Box
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: isLessThanThreshold
                  ? "error.main"
                  : "success.main",
                animation: isLessThanThreshold ? "pulse 1.5s infinite" : "none",
                "@keyframes pulse": {
                  "0%": {
                    boxShadow: "0 0 0 0 rgba(211, 47, 47, 0.7)",
                  },
                  "70%": {
                    boxShadow: "0 0 0 8px rgba(211, 47, 47, 0)",
                  },
                  "100%": {
                    boxShadow: "0 0 0 0 rgba(211, 47, 47, 0)",
                  },
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: "it_Name",
      headerName: "Item Name",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Item Category",
      flex: 1,
    },
    {
      field: "brand",
      headerName: "Brand",
      flex: 1,
    },
    {
      field: "threshold",
      headerName: "Threshold",
      width: 150,
    },
    {
      field: "flag",
      headerName: "Flag",
      width: 100,
      disableColumnMenu: true,

      renderCell: (params) => {
        const flagItem = params.value as boolean;
        return (
          <Chip
            label={flagItem ? "Avoid" : "Preferred"}
            size="small"
            color={flagItem ? "warning" : "success"}
            variant={flagItem ? "outlined" : "filled"}
          />
        );
      },
    },
    {
      field: "unitOfMeasure",
      headerName: "UOM",
      width: 100,
      hideSortIcons: true,
    },
    {
      field: "currentQuantity",
      headerName: "Current Quantity",
      flex: 1,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        const isActive = params.row.isActive as boolean;
        return (
          <Chip
            icon={isActive ? <CheckCircleIcon /> : <ArchiveIcon />}
            label={isActive ? "Active" : "Archived"}
            size="small"
            color={isActive ? "success" : "default"}
            variant={isActive ? "filled" : "outlined"}
          />
        );
      },
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
    setFormItem(emptyItem);
    setDialogOpen(true);
  };

  // view / edit item — fetch the full item then open the dialog in the right mode
  const loadItemIntoDialog = (id: number, targetMode: DialogMode) => {
    setMode(targetMode);
    setFormItem(emptyItem);
    setDialogOpen(true);
    setIsFetchingItem(true);
    apiClient
      .get(`/items/${id}`)
      .then((res) => setFormItem(res.data))
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
  };

  const handleFormItemChange = <k extends keyof Item>(
    field: k,
    value: Item[k],
  ) => {
    setFormItem((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    name: formItem.it_Name,
    categoryId: formItem.category_Id,
    brandId: formItem.brand_Id,
    threshold: formItem.threshold,
    unitOfMeasure: formItem.unitOfMeasure,
    flag: formItem.flag,
    notes: formItem.notes || null,
  });

  const handleAddSubmit = () => {
    setIsSubmitting(true);
    apiClient
      .post("/items", buildPayload())
      .then((res) => {
        setItems((prev) => [...prev, res.data]);
        showSuccess("Item created successfully.");
        setDialogOpen(false);
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to create item.";
        showError(message);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleEditSubmit = () => {
    setIsSubmitting(true);
    apiClient
      .put(`/items/${formItem.id}`, {
        ...buildPayload(),
        isActive: formItem.isActive,
      })
      .then(() => apiClient.get(`/items/${formItem.id}`))
      .then((res) => {
        setItems((prev) =>
          prev.map((it) => (it.id === formItem.id ? res.data : it)),
        );
        showSuccess("Item updated successfully.");
        setDialogOpen(false);
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to update item.";
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
      .delete(`items/${selectedDeleteId}`)
      .then(() => {
        setItems((prev) => prev.filter((it) => it.id != selectedDeleteId));
        showSuccess("Item deleted succesfully");
        handleCloseDeleteDialog();
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to update item.";
        showError(message);
      })
      .finally(() => setIsDeleting(false));
  };

  const dialogTitle =
    mode === "add"
      ? "Add New Item"
      : mode === "edit"
        ? "Edit Item"
        : "View Item";
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
          Add New Item
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          rows={items}
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

      {/* Add / Edit / View Item Dialog */}
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
          <AddEditItem
            item={formItem}
            onChange={handleFormItemChange}
            readOnly={mode === "view"}
            isCreate={mode === "add"}
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
        Are you sure you want to delete this category? This action cannot be
        undone.
      </FormDialog>
    </Box>
  );
}
