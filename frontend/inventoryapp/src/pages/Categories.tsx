import apiClient from "@/api/client";
import type Category from "@/interfaces/ICategorie";
import { Button, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "@/context/SnackbarContext";
import FormDialog from "@/components/Dialog/FormDialog";
import axios from "axios";
import CategoryFormFields from "@/components/Dialog/CategoryFormFields";
import { useLoading } from "@/context/LoadingContext";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [open, setOpen] = useState(false);
  const { showError, showSuccess } = useSnackbar();
  const { setIsLoading } = useLoading();

  // Create State
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [loading, setLoading] = useState(false);

  //View State
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);

  //Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => showError("Failed to load categories."))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: GridColDef<(typeof categories)[number]>[] = [
    {
      field: "cat_Name",
      headerName: "Category Name",
      flex: 1,
    },
    {
      field: "cat_Description",
      headerName: "Description",
      flex: 2,
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

  // create category
  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setCatName("");
    setCatDescription("");
  };

  const handleSubmit = async () => {
    if (!catName.trim()) {
      showError("Category name cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/categories", {
        cat_Name: catName,
        cat_Description: catDescription,
      });

      const newCategory = {
        id: response.data.id,
        cat_Name: catName,
        cat_Description: catDescription,
      };

      setCategories((prevCategories) => [...prevCategories, newCategory]);

      showSuccess("Category created succesfully.");
      handleClose();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          "Failed to save category. Please try again.")
        : "Failed to save category. Please try again.";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  //view category
  const handleView = (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setViewCategory(category);
      setViewOpen(true);
    }
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setViewCategory(null);
  };

  //edit category
  const handleEdit = (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setEditId(id);
      setEditName(category.cat_Name);
      setEditDescription(category.cat_Description ?? "");
      setEditOpen(true);
    }
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleEditSubmit = async () => {
    if (editId === null) return;
    setEditLoading(true);

    try {
      await apiClient.put(`categories/${editId}`, {
        cat_Name: editName,
        cat_Description: editDescription,
      });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editId
            ? { ...c, cat_Name: editName, cat_Description: editDescription }
            : c,
        ),
      );
      showSuccess("Category updated succesfully");
      handleCloseEdit();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to update category")
        : "Failed to update category";
      showError(message);
    } finally {
      setEditLoading(false);
    }
  };
  // delete category
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

    try {
      await apiClient.delete(`categories/${selectedDeleteId}`);
      setCategories((prev) => prev.filter((cat) => cat.id != selectedDeleteId));
      showSuccess("Category deleted succesfully");
      handleCloseDeleteDialog();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          "Failed to delete category. Please try again.")
        : "Failed to delete category. Please try again.";
      showError(message);
    } finally {
      setIsDeleting(false);
    }
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
          onClick={handleOpen}
        >
          Add New Category
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <DataGrid
          rows={categories}
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

      {/* Create Dialog */}
      <FormDialog
        open={open}
        onClose={handleClose}
        title="Add New Category"
        submitLabel="Save"
        onSubmit={handleSubmit}
        isSubmitting={loading}
      >
        <CategoryFormFields
          name={catName}
          description={catDescription}
          onNameChange={setCatName}
          onDescriptionChange={setCatDescription}
        />
      </FormDialog>

      {/* View Dialog */}
      <FormDialog
        open={viewOpen}
        onClose={handleCloseView}
        title="View Category"
        submitLabel="Close"
        onSubmit={handleCloseView}
        isViewOnly
      >
        <CategoryFormFields
          name={viewCategory?.cat_Name ?? ""}
          description={viewCategory?.cat_Description ?? ""}
          onNameChange={() => {}}
          onDescriptionChange={() => {}}
          readOnly
        />
      </FormDialog>

      {/* Edit Dialog */}
      <FormDialog
        open={editOpen}
        onClose={handleCloseEdit}
        title="Edit Category"
        submitLabel="Update"
        onSubmit={handleEditSubmit}
        isSubmitting={editLoading}
      >
        <CategoryFormFields
          name={editName}
          description={editDescription}
          onNameChange={setEditName}
          onDescriptionChange={setEditDescription}
        />
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
