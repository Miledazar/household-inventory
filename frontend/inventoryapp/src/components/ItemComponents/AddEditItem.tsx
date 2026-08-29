import apiClient from "@/api/client";
import type Brand from "@/interfaces/IBrand";
import type Category from "@/interfaces/ICategorie";
import type Item from "@/interfaces/IItem";
import {
  Autocomplete,
  Box,
  FormControlLabel,
  IconButton,
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
import type { UnitOfMeasure } from "@/interfaces/IUnitOfMeasure";
interface AddEditItemProps {
  item: Item;
  onChange: <K extends keyof Item>(field: K, value: Item[K]) => void;
  readOnly?: boolean;
  isCreate?: boolean;
}

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

  const [unitOfMeasures, setUnitOfMeasures] = useState<UnitOfMeasure[]>([]);
  const [loadingUom, setLoadingUom] = useState(true);
  const [uomError, setUomError] = useState<string | null>(null);

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

  // create uom
  const [quickUomOpen, setQuickUomOpen] = useState(false);
  const emptyUom: UnitOfMeasure = {
    id: 0,
    name: "",
    allowsDecimal: false,
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
  useEffect(() => {
    apiClient
      .get("/unitofmeasures")
      .then((res) => setUnitOfMeasures(res.data))
      .catch(() => setUomError("Failed to load brands."))
      .finally(() => setLoadingUom(false));
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
            <Autocomplete
              options={categories}
              fullWidth
              getOptionLabel={(cat) => cat.cat_Name}
              value={
                categories.find((cat) => cat.id === item.category_Id) ?? null
              }
              onChange={(_, newValue) =>
                onChange("category_Id", newValue ? newValue.id : null)
              }
              loading={loadingCategories}
              disabled={!!categoriesError}
              readOnly={readOnly}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  error={!!categoriesError}
                  helperText={categoriesError}
                  sx={{ mt: 1 }}
                />
              )}
            />

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
                    mt: 1,
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
            <Autocomplete
              options={brands}
              fullWidth
              getOptionLabel={(br) => br.br_Name}
              value={brands.find((br) => br.id === item.brand_Id) ?? null}
              onChange={(_, newValue) =>
                onChange("brand_Id", newValue ? newValue.id : null)
              }
              loading={loadingBrands}
              disabled={!!brandsError}
              readOnly={readOnly}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Brand"
                  error={!!brandsError}
                  helperText={brandsError}
                  sx={{ mb: 2, mt: 1 }}
                />
              )}
            />

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

            {!isCreate && (
              <TextField
                label="Current Quantity"
                fullWidth
                value={item.currentQuantity}
                slotProps={{ input: { readOnly: true } }}
                sx={{ mb: 2, mt: 1 }}
              />
            )}
          </Stack>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Autocomplete
              options={unitOfMeasures}
              fullWidth
              getOptionLabel={(uom) => uom.name}
              value={
                unitOfMeasures.find(
                  (uom) => uom.id === item.unitOfMeasure_Id,
                ) ?? null
              }
              onChange={(_, newValue) =>
                onChange("unitOfMeasure_Id", newValue ? newValue.id : null)
              }
              loading={loadingUom}
              disabled={!!uomError}
              readOnly={readOnly}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unit Of Measure"
                  error={!!uomError}
                  helperText={uomError}
                  sx={{ mb: 2, mt: 1 }}
                />
              )}
            />

            {!readOnly && (
              <Tooltip title="Add New Unit of measure">
                <IconButton
                  color="primary"
                  onClick={() => setQuickUomOpen(true)}
                  disabled={loadingUom}
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

          {/* Create UOM */}
          <QuickCreateDialog<UnitOfMeasure>
            open={quickUomOpen}
            onClose={() => setQuickUomOpen(false)}
            title="Add New Unit of measure"
            endpoint="/unitofmeasures"
            initialValue={emptyUom}
            onCreated={(created: UnitOfMeasure) => {
              setUnitOfMeasures((prev) => [...prev, created]);
              onChange("unitOfMeasure_Id", created.id);
            }}
            successMessage="Unit of measure created succesfully."
            renderFields={(value, onChange) => (
              <>
                <TextField
                  autoFocus
                  label="Unit of measure Name"
                  fullWidth
                  required
                  value={value.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  sx={{ mb: 2, mt: 1 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={value.allowsDecimal}
                      onChange={(e) =>
                        onChange("allowsDecimal", Boolean(e.target.value))
                      }
                    />
                  }
                  label="Allows Decimal Quantities"
                />
              </>
            )}
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
