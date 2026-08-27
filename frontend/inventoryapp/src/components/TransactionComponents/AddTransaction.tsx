import { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Tab,
  Autocomplete,
  Button,
  Divider,
  Typography,
} from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AddIcon from "@mui/icons-material/Add";

import apiClient from "@/api/client";
import { QuickCreateDialog } from "../Dialog/QuickCreateDialog";
import type {
  TransactionType,
  CreateTransactionDto,
  CreateTransactionLineDto,
} from "@/interfaces/ITransaction";
import type Store from "@/interfaces/IStore";
import type Item from "@/interfaces/IItem";
import type Brand from "@/interfaces/IBrand";
import FormDialog from "../Dialog/FormDialog";
import { AddEditItem } from "../ItemComponents/AddEditItem";
import type { Batche } from "@/interfaces/IBatches";
import { AddItemToTransaction } from "./AddItemToTransaction";

interface AddTransactionProps {
  transaction: CreateTransactionDto;
  onChange: <K extends keyof CreateTransactionDto>(
    field: K,
    value: CreateTransactionDto[K],
  ) => void;
  readOnly?: boolean;
}

const TRANSACTION_TYPES: TransactionType[] = [
  "Purchase",
  "Consumption",
  "Adjustment",
  "Wasted",
];

export function AddTransaction({
  transaction,
  onChange,
  readOnly = false,
}: AddTransactionProps) {
  const [tab, setTab] = useState("1");

  // Stores
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [quickStoreOpen, setQuickStoreOpen] = useState(false);
  const emptyStore: Store = { id: 0, st_Name: "" };

  // Items (for the line picker)
  const [items, setItems] = useState<Item[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Quick-create Item (with its own Category/Brand quick-create inside, via AddEditItem)
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
  const [batches, setBatches] = useState<Batche[]>([]);

  // const [availableBatches, setAvailableBatches] = useState<
  //   Record<
  //     number,
  //     { id: number; remainingQuantity: number; expirationDate: string | null }[]
  //   >
  // >({});

  useEffect(() => {
    apiClient
      .get("/stores")
      .then((res) => setStores(res.data))
      .catch(() => setStoresError("Failed to load stores."))
      .finally(() => setLoadingStores(false));
  }, []);

  useEffect(() => {
    Promise.all([
      apiClient.get("/items"),
      apiClient.get("/brands"),
      apiClient.get("/Items/batches"),
    ])
      .then(([itemsRes, brandsRes, batchesRes]) => {
        setItems(itemsRes.data);
        setBrands(brandsRes.data);
        setBatches(batchesRes.data);
      })
      .finally(() => setLoadingItems(false));
  }, []);

  const handleTabChange = (_e: React.SyntheticEvent, newValue: string) =>
    setTab(newValue);

  const isTransactionConsuptionOrWasted =
    transaction.type === "Consumption" || transaction.type === "Wasted";

  const itemOptions = useMemo(() => {
    const filteredItems = isTransactionConsuptionOrWasted
      ? items.filter((itm) => itm.currentQuantity > 0)
      : items;
    return filteredItems.map((item) => {
      const brand = brands.find((b) => b.id === item.brand_Id);
      const label = brand ? `${item.it_Name} (${brand.br_Name})` : item.it_Name;
      return { id: item.id, label };
    });
  }, [items, brands, isTransactionConsuptionOrWasted]);

  const handleAddLine = () => {
    if (selectedItemId === null) return;
    const newLine: CreateTransactionLineDto = {
      itemId: selectedItemId,
      quantity: 1,
      unitPrice: null,
      expirationDate: null,
      batchId: null,
    };
    onChange("lines", [...transaction.lines, newLine]);
    setSelectedItemId(null);
  };

  const handleLineChange = <K extends keyof CreateTransactionLineDto>(
    index: number,
    field: K,
    value: CreateTransactionLineDto[K],
  ) => {
    const updated = transaction.lines.map((line, i) =>
      i === index ? { ...line, [field]: value } : line,
    );
    onChange("lines", updated);
  };

  const handleRemoveLine = (index: number) => {
    onChange(
      "lines",
      transaction.lines.filter((_, i) => i !== index),
    );
  };

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

  // const fetchBatchesForItem = (itemId: number) => {
  //   if (availableBatches[itemId]) return;
  //   apiClient.get(`/items/${itemId}/batches`).then((res) => {
  //     setAvailableBatches((prev) => ({ ...prev, [itemId]: res.data }));
  //   });
  // };

  const handleTypeChange = <K extends keyof CreateTransactionDto>(
    field: K,

    value: CreateTransactionDto[K],
  ) => {
    onChange(field, value);

    onChange(
      "lines",
      transaction.lines.filter(() => 1 != 1),
    );
  };
  return (
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList onChange={handleTabChange} variant="fullWidth">
          <Tab label="Details" value="1" />
          <Tab label="Items" value="2" />
        </TabList>
      </Box>

      <TabPanel value="1">
        <TextField
          select
          label="Type"
          fullWidth
          value={transaction.type}
          onChange={(e) =>
            handleTypeChange("type", e.target.value as TransactionType)
          }
          required
          disabled={readOnly}
          slotProps={{ input: { readOnly } }}
          sx={{ mb: 2, mt: 1 }}
        >
          {TRANSACTION_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Date"
          type="date"
          fullWidth
          value={transaction.date.slice(0, 10)}
          onChange={(e) =>
            onChange("date", new Date(e.target.value).toISOString())
          }
          required
          slotProps={{ input: { readOnly }, inputLabel: { shrink: true } }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
          <TextField
            select
            label="Store (optional)"
            fullWidth
            value={transaction.storeId ?? ""}
            onChange={(e) =>
              onChange(
                "storeId",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            disabled={loadingStores || !!storesError}
            error={!!storesError}
            helperText={storesError}
            slotProps={{ input: { readOnly } }}
          >
            <MenuItem value="">No store</MenuItem>
            {stores.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.st_Name}
              </MenuItem>
            ))}
          </TextField>

          {!readOnly && (
            <Tooltip title="Add New Store">
              <IconButton
                color="primary"
                onClick={() => setQuickStoreOpen(true)}
                disabled={loadingStores}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: "14px",
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <QuickCreateDialog<Store>
          open={quickStoreOpen}
          onClose={() => setQuickStoreOpen(false)}
          title="Add New Store"
          endpoint="/stores"
          initialValue={emptyStore}
          successMessage="Store created successfully."
          onCreated={(created) => {
            setStores((prev) => [...prev, created]);
            onChange("storeId", created.id);
          }}
          renderFields={(value, onChangeField) => (
            <TextField
              autoFocus
              label="Store Name"
              fullWidth
              required
              value={value.st_Name}
              onChange={(e) => onChangeField("st_Name", e.target.value)}
              sx={{ mb: 2, mt: 1 }}
            />
          )}
        />

        <TextField
          label="Notes"
          fullWidth
          multiline
          rows={2}
          value={transaction.notes ?? ""}
          onChange={(e) => onChange("notes", e.target.value)}
          slotProps={{ input: { readOnly } }}
        />
      </TabPanel>

      <TabPanel value="2" sx={{ px: 0 }}>
        <Box
          sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 3 }}
        >
          <Autocomplete
            fullWidth
            options={itemOptions}
            loading={loadingItems}
            value={itemOptions.find((o) => o.id === selectedItemId) ?? null}
            onChange={(_e, newValue) => setSelectedItemId(newValue?.id ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Select Item" />
            )}
            disabled={readOnly}
          />
          {!readOnly && (
            <>
              <Button
                variant="contained"
                onClick={handleAddLine}
                disabled={selectedItemId === null}
                sx={{ height: 56, flexShrink: 0 }}
              >
                Add
              </Button>
              {!isTransactionConsuptionOrWasted && (
                <Tooltip title="Create New Item">
                  <IconButton
                    color="primary"
                    onClick={() => setQuickItemOpen(true)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      height: 56,
                      width: 56,
                      flexShrink: 0,
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />
        {transaction.lines.map((line, idx) => (
          <AddItemToTransaction
            key={idx}
            batches={batches}
            handleLineChange={handleLineChange}
            handleRemoveLine={handleRemoveLine}
            index={idx}
            item={items.find((itm) => itm.id === line.itemId)!}
            line={line}
            readOnly={readOnly}
            type={transaction.type}
          />
        ))}
        {transaction.lines.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 2 }}
          >
            No items added yet.
          </Typography>
        )}
        <FormDialog
          open={quickItemOpen}
          onClose={() => setQuickItemOpen(false)}
          title="Add New Item"
          onSubmit={handleCreateItem}
          submitLabel="Create"
        >
          <AddEditItem item={newItem} onChange={handleNewItemChange} isCreate />
        </FormDialog>
      </TabPanel>
    </TabContext>
  );
}
