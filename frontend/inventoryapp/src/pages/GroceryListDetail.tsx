import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import apiClient from "@/api/client";
import { useSnackbar } from "@/context/SnackbarContext";
import type Grocery from "@/interfaces/IGrocery";
import type Item from "@/interfaces/IItem";
import FormDialog from "@/components/Dialog/FormDialog";
import { AddEditItem } from "@/components/ItemComponents/AddEditItem";
import { useLoading } from "@/context/LoadingContext";

interface GroceryListItem {
  id: number;
  groceryListId: number;
  itemId: number;
  quantityNeeded: number;
  isChecked: boolean;
  estimatedPrice: number | null;
}

export default function GroceryListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useSnackbar();

  const [list, setList] = useState<Grocery | null>(null);
  const [listItems, setListItems] = useState<GroceryListItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const { setIsLoading } = useLoading();

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quickItemOpen, setQuickItemOpen] = useState(false);
  const emptyNewItem: Item = {
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
  const [newItem, setNewItem] = useState<Item>(emptyNewItem);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        apiClient.get(`/grocerylists/${id}`),
        apiClient.get(`/grocerylists/${id}/items`),
        apiClient.get("/items"),
      ])
        .then(([listRes, itemsRes, allItemsRes]) => {
          setList(listRes.data);
          setListItems(itemsRes.data);
          setItems(allItemsRes.data);
        })
        .catch(() => showError("Failed to load grocery list."))
        .finally(() => setIsLoading(false));
    };
    fetchData();
  }, [id]);

  const itemOptions = useMemo(() => {
    return items
      .filter((i) => !listItems.some((li) => li.itemId === i.id))
      .map((i) => ({
        id: i.id,
        label: i.it_Name,
        brand: i.brand,
      }));
  }, [items, listItems]);

  const itemById = (itemId: number) => items.find((i) => i.id === itemId);

  // Check/uncheck (persists immediately)
  const handleToggleChecked = (listItem: GroceryListItem) => {
    const newValue = !listItem.isChecked;
    setListItems((prev) =>
      prev.map((li) =>
        li.id === listItem.id ? { ...li, isChecked: newValue } : li,
      ),
    );
    apiClient
      .patch(`/grocerylists/items/${listItem.id}/check`, newValue, {
        headers: { "Content-Type": "application/json" },
      })
      .catch(() => {
        showError("Failed to update item.");
        setListItems((prev) =>
          prev.map((li) =>
            li.id === listItem.id ? { ...li, isChecked: !newValue } : li,
          ),
        );
      });
  };

  // Inline quantity/price edit
  const handleFieldBlur = (
    listItem: GroceryListItem,
    field: "quantityNeeded" | "estimatedPrice",
    value: number | null,
  ) => {
    apiClient
      .patch(`/grocerylists/items/${listItem.id}`, { [field]: value })
      .catch(() => showError("Failed to update item."));
  };

  const handleFieldChange = (
    id: number,
    field: "quantityNeeded" | "estimatedPrice",
    value: number | null,
  ) => {
    setListItems((prev) =>
      prev.map((li) => (li.id === id ? { ...li, [field]: value } : li)),
    );
  };

  // Add item
  const handleAddItem = () => {
    if (selectedItemId === null || !id) return;
    apiClient
      .post(`/grocerylists/${id}/items`, {
        itemId: selectedItemId,
        quantityNeeded: 1,
      })
      .then(() => {
        setSelectedItemId(null);
        return apiClient.get(`/grocerylists/${id}/items`);
      })
      .then((res) => setListItems(res.data))
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to add item.";
        showError(message);
      });
  };

  // Remove item
  const handleRemoveItem = (listItemId: number) => {
    apiClient
      .delete(`/grocerylists/items/${listItemId}`)
      .then(() =>
        setListItems((prev) => prev.filter((li) => li.id !== listItemId)),
      )
      .catch(() => showError("Failed to remove item."));
  };

  // Quick-create item
  const handleNewItemChange = <K extends keyof Item>(
    field: K,
    value: Item[K],
  ) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateItem = () => {
    apiClient
      .post("/items", {
        name: newItem.it_Name,
        categoryId: newItem.category_Id,
        brandId: newItem.brand_Id,
        threshold: newItem.threshold,
        unitOfMeasure: newItem.unitOfMeasure,
        flag: newItem.flag,
        notes: newItem.notes || null,
      })
      .then((res) => {
        const created: Item = { ...newItem, id: res.data.id };
        setItems((prev) => [...prev, created]);
        setSelectedItemId(created.id);
        setQuickItemOpen(false);
        setNewItem(emptyNewItem);
      });
  };

  const handleFinishShopping = () => {
    apiClient
      .post(`grocerylists/${id}/prepare-transaction`)
      .then((res) => {
        navigate("/transactions", { state: { prefilledDraft: res.data } });
      })
      .catch((err) => {
        const message =
          typeof err?.response?.data === "string"
            ? err.response.data
            : "Failed to prepare transaction.";
        showError(message);
      });
  };

  // Close list
  const handleCloseList = () => {
    apiClient
      .post(`/grocerylists/${id}/close`)
      .then(() => {
        showSuccess("List closed.");
        navigate("/grocery-lists");
      })
      .catch(() => showError("Failed to close list."));
  };

  if (!list) return null;

  const checkedCount = listItems.filter((li) => li.isChecked).length;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate("/grocery-lists")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{list.gr_Name}</Typography>
        <Chip
          label={list.status}
          color={list.status === "Active" ? "success" : "default"}
          size="small"
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 3 }}>
        <Autocomplete
          sx={{ width: 300 }}
          options={itemOptions}
          value={itemOptions.find((o) => o.id === selectedItemId) ?? null}
          onChange={(_e, newValue) => setSelectedItemId(newValue?.id ?? null)}
          getOptionLabel={(option) =>
            option.brand ? `${option.label} (${option.label})` : option.label
          }
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="body2">{option.label}</Typography>
                {option.brand && (
                  <Typography variant="caption" color="text.secondary">
                    {option.brand}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="Add Item" size="small" />
          )}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleAddItem}
          disabled={selectedItemId === null}
        >
          Add
        </Button>
        <Tooltip title="Create New Item">
          <IconButton color="primary" onClick={() => setQuickItemOpen(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {listItems.map((li) => {
          const item = itemById(li.itemId);

          return (
            <Box
              key={li.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Checkbox
                checked={li.isChecked}
                onChange={() => handleToggleChecked(li)}
              />

              <Box
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Typography>
                  {item?.it_Name}
                  {item?.brand && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {" "}
                      ({item.brand})
                    </Typography>
                  )}
                </Typography>
              </Box>

              {item?.flag && (
                <Chip
                  label="Avoid"
                  size="small"
                  color={item.flag ? "error" : "success"}
                  variant="outlined"
                />
              )}

              <TextField
                label="Qty"
                type="number"
                size="small"
                sx={{ width: 90 }}
                value={li.quantityNeeded}
                slotProps={{ input: { inputProps: { min: 0, step: "1" } } }}
                onChange={(e) =>
                  handleFieldChange(
                    li.id,
                    "quantityNeeded",
                    Number(e.target.value),
                  )
                }
                onBlur={(e) =>
                  handleFieldBlur(li, "quantityNeeded", Number(e.target.value))
                }
              />
              <TextField
                label="Est. Price"
                type="number"
                size="small"
                sx={{ width: 110 }}
                value={li.estimatedPrice ?? ""}
                slotProps={{ input: { inputProps: { min: 0, step: "0.01" } } }}
                onChange={(e) =>
                  handleFieldChange(
                    li.id,
                    "estimatedPrice",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                onBlur={(e) =>
                  handleFieldBlur(
                    li,
                    "estimatedPrice",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              />
              <IconButton
                color="error"
                size="small"
                onClick={() => handleRemoveItem(li.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
        {listItems.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No items on this list yet.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleCloseList}
          disabled={list.status !== "Active"}
        >
          Close List
        </Button>
        <Button
          variant="contained"
          disabled={checkedCount === 0}
          onClick={handleFinishShopping}
        >
          Finish Shopping ({checkedCount})
        </Button>
      </Box>

      <FormDialog
        open={quickItemOpen}
        onClose={() => setQuickItemOpen(false)}
        title="Add New Item"
        onSubmit={handleCreateItem}
        submitLabel="Create"
      >
        <AddEditItem item={newItem} onChange={handleNewItemChange} isCreate />
      </FormDialog>
    </Box>
  );
}
