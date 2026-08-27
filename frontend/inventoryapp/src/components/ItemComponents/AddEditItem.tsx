import apiClient from "@/api/client";
import type Brand from "@/interfaces/IBrand";
import type Category from "@/interfaces/ICategorie";
import type Item from "@/interfaces/IItem";
import {
  Box,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AddIcon from "@mui/icons-material/Add";
import { BatchComponent } from "./BatchComponent";
import { QuickCreateDialog } from "../Dialog/QuickCreateDialog";
interface AddEditItemProps {
  item: Item;
  onChange: <K extends keyof Item>(field: K, value: Item[K]) => void;
  readOnly?: boolean;
  isCreate?: boolean;
}

const UNIT_OF_MEASURE_OPTIONS = [
  "Piece",
  "Pack",
  "Box",
  "Bag",
  "Roll",
  "Bottle",
  "Can",
  "Jar",
  "Bar",
  "Sheet",
  "Pair",
  "g",
  "Kg",
  "lb",
  "oz",
  "ml",
  "L",
  "fl oz",
  "Gallon",
  "Tablet",
  "Refill",
  "Tube",
] as const;

export function AddEditItem({
  item,
  onChange,
  readOnly = false,
  isCreate = false,
}: AddEditItemProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [value, setValue] = useState("1");

  // create category
  const [quickCategoryOpen, setQuickCategoryOpen] = useState(false);
  const emptyCategory: Category = {
    id: 0,
    cat_Name: "",
    cat_Description: "",
  };

  // create brand
  const [quickBrandOpen, setQuickBrandOpen] = useState(false);
  const emptyBrand: Brand = {
    id: 0,
    br_Name: "",
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  useEffect(() => {
    apiClient
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategoriesError("Failed to load categories."))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    apiClient
      .get("/brands")
      .then((res) => setBrands(res.data))
      .catch(() => setBrandsError("Failed to load brands."))
      .finally(() => setLoadingBrands(false));
  }, []);

  return (
    <>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} variant="fullWidth">
            <Tab label="Item Details" value="1" />
            {!isCreate && <Tab label="Batches" value="2" />}
          </TabList>
        </Box>
        <TabPanel
          value="1"
          sx={{
            border: 1,
            maxHeight: 480,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            overflowY: "auto",
          }}
        >
          <TextField
            autoFocus={!readOnly}
            label="Item Name"
            fullWidth
            value={item.it_Name}
            onChange={(e) => onChange("it_Name", e.target.value)}
            required
            slotProps={{ input: { readOnly } }}
            sx={{ mb: 2, mt: 1 }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              mb: 2,
              mt: 1,
            }}
          >
            <TextField
              select
              label="Category"
              fullWidth
              value={item.category_Id ?? ""}
              onChange={(e) => onChange("category_Id", Number(e.target.value))}
              required
              disabled={loadingCategories || !!categoriesError}
              error={!!categoriesError}
              helperText={categoriesError}
              slotProps={{ input: { readOnly } }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.cat_Name}
                </MenuItem>
              ))}
            </TextField>

            {!readOnly && (
              <Tooltip title="Add New Category">
                <IconButton
                  color="primary"
                  onClick={() => setQuickCategoryOpen(true)}
                  disabled={loadingCategories}
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

          {/* Create Category */}
          <QuickCreateDialog<Category>
            open={quickCategoryOpen}
            onClose={() => setQuickCategoryOpen(false)}
            title="Add New Category"
            endpoint="/categories"
            initialValue={emptyCategory}
            onCreated={(created: Category) => {
              setCategories((prev) => [...prev, created]);
              onChange("category_Id", created.id);
            }}
            successMessage="Category created succesfully."
            renderFields={(value, onChange) => (
              <>
                <TextField
                  autoFocus
                  label="Category Name"
                  fullWidth
                  required
                  value={value.cat_Name}
                  onChange={(e) => onChange("cat_Name", e.target.value)}
                  sx={{ mb: 2, mt: 1 }}
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={value.cat_Description ?? ""}
                  onChange={(e) => onChange("cat_Description", e.target.value)}
                />
              </>
            )}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <TextField
              select
              label="Brand"
              fullWidth
              value={item.brand_Id ?? ""}
              onChange={(e) => onChange("brand_Id", Number(e.target.value))}
              disabled={loadingBrands || !!brandsError}
              error={!!brandsError}
              helperText={brandsError}
              slotProps={{ input: { readOnly } }}
              sx={{ mb: 2, mt: 1 }}
            >
              {brands.map((br) => (
                <MenuItem key={br.id} value={br.id}>
                  {br.br_Name}
                </MenuItem>
              ))}
            </TextField>

            {!readOnly && (
              <Tooltip title="Add New Brand">
                <IconButton
                  color="primary"
                  onClick={() => setQuickBrandOpen(true)}
                  disabled={loadingBrands}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    p: "14px",
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Create Brand */}
          <QuickCreateDialog<Brand>
            open={quickBrandOpen}
            onClose={() => setQuickBrandOpen(false)}
            title="Add New Brand"
            endpoint="/brands"
            initialValue={emptyBrand}
            onCreated={(created: Brand) => {
              setBrands((prev) => [...prev, created]);
              onChange("brand_Id", created.id);
            }}
            successMessage="Brand created succesfully."
            renderFields={(value, onChange) => (
              <>
                <TextField
                  autoFocus
                  label="Brand Name"
                  fullWidth
                  required
                  value={value.br_Name}
                  onChange={(e) => onChange("br_Name", e.target.value)}
                  sx={{ mb: 2, mt: 1 }}
                />
              </>
            )}
          />

          <Stack direction="row" sx={{ paddingY: 1 }} spacing={2}>
            <TextField
              label="Threshold"
              fullWidth
              value={item.threshold}
              onChange={(e) => onChange("threshold", Number(e.target.value))}
              required
              slotProps={{ input: { readOnly } }}
              sx={{ mb: 2, mt: 1 }}
            />

            <TextField
              label="Current Quantity"
              fullWidth
              value={item.currentQuantity}
              slotProps={{ input: { readOnly: true } }}
              sx={{ mb: 2, mt: 1 }}
            />
          </Stack>

          <TextField
            select
            label="Unit of Measure"
            fullWidth
            value={item.unitOfMeasure}
            onChange={(e) => onChange("unitOfMeasure", e.target.value)}
            required
            disabled={readOnly}
            slotProps={{ input: { readOnly } }}
            sx={{ mb: 2, mt: 1 }}
          >
            {UNIT_OF_MEASURE_OPTIONS.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notes"
            fullWidth
            value={item.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            slotProps={{ input: { readOnly } }}
            sx={{ mb: 2, mt: 1 }}
          />
          <Stack spacing={1} direction="row">
            <FormControlLabel
              control={
                <Switch
                  checked={!item.flag} //isPreferred
                  onChange={(e) => onChange("flag", !e.target.checked)} //Flag =  !isPreferred
                  disabled={readOnly}
                  color="error"
                />
              }
              label={item.flag ? "Avoid" : "Preferred"}
              sx={{ mb: 2, display: "block" }}
            />

            {!isCreate && (
              <FormControlLabel
                control={
                  <Switch
                    checked={item.isActive}
                    onChange={(e) => onChange("isActive", e.target.checked)}
                    disabled={readOnly}
                    color="success"
                  />
                }
                label={item.isActive ? "Active" : "Archived"}
                sx={{ mb: 2, display: "block" }}
              />
            )}
          </Stack>
        </TabPanel>
        {!isCreate && (
          <TabPanel value="2">
            <BatchComponent itemId={item.id} />
          </TabPanel>
        )}
      </TabContext>
    </>
  );
}
