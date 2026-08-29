import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Card, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import apiClient from "@/api/client";
import { useSnackbar } from "@/context/SnackbarContext";
import { useLoading } from "@/context/LoadingContext";

interface Summary {
  totalSpent: number;
  currentStockValue: number;
  wasteValue: number;
}

interface LowStockItem {
  itemId: number;
  name: string;
  currentQuantity: number;
  threshold: number;
  unitOfMeasure: string;
  brandName?: string;
}

interface ExpiringBatch {
  batchId: number;
  itemId: number;
  itemName: string;
  remainingQuantity: number;
  expirationDate: string;
  unitOfMeasure: string;
  brandName?: string;
}

interface CategorySpending {
  categoryName: string;
  totalSpent: number;
}

const money = (n: number) => `$${n.toFixed(2)}`;
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const CARD_HEIGHT = 320;

const rowSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 1,
  py: 1,
  borderBottom: "1px solid #EFF1F6",
  "&:last-of-type": { borderBottom: "none" },
};

const numSx = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontVariantNumeric: "tabular-nums" as const,
  fontSize: "0.82rem",
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "error" | "success";
}) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontSize: "0.7rem",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          fontSize: "1.75rem",
          color:
            tone === "error"
              ? "error.main"
              : tone === "success"
                ? "success.main"
                : "text.primary",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Typography>
    </Card>
  );
}

function ListCard({
  title,
  accent,
  height,
  children,
}: {
  title: string;
  accent: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        height: height ?? CARD_HEIGHT,
        borderLeft: `3px solid ${accent}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2.25, pb: 1.5 }}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Box sx={{ px: 2.25, pb: 2, flexGrow: 1, overflowY: "auto" }}>
        {children}
      </Box>
    </Card>
  );
}

function groupByItem(batches: ExpiringBatch[]): [string, ExpiringBatch[]][] {
  const groups: Record<string, ExpiringBatch[]> = {};
  batches.forEach((b) => {
    const key = b.brandName ? `${b.itemName} (${b.brandName})` : b.itemName;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });
  return Object.entries(groups);
}

function GroupedBatchList({
  groups,
  dateColor,
}: {
  groups: [string, ExpiringBatch[]][];
  dateColor: "warning.main" | "error.main";
}) {
  return (
    <>
      {groups.map(([itemName, batches]) => (
        <Box
          key={itemName}
          sx={{
            py: 1,
            borderBottom: "1px solid #EFF1F6",
            "&:last-of-type": { borderBottom: "none" },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {itemName}
          </Typography>
          {batches.map((b) => (
            <Box
              key={b.batchId}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pl: 1,
                mt: 0.25,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {b.remainingQuantity} {b.unitOfMeasure}
              </Typography>
              <Typography
                sx={{ ...numSx, fontSize: "0.75rem" }}
                color={dateColor}
              >
                {shortDate(b.expirationDate)}
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </>
  );
}

export default function Dashboard() {
  const { showError } = useSnackbar();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [expiring, setExpiring] = useState<ExpiringBatch[]>([]);
  const [expired, setExpired] = useState<ExpiringBatch[]>([]);
  const [spending, setSpending] = useState<CategorySpending[]>([]);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiClient.get("/dashboard/summary"),
      apiClient.get("/dashboard/low-stock"),
      apiClient.get("/dashboard/expiring-soon"),
      apiClient.get("/dashboard/expired"),
      apiClient.get("/dashboard/spending-by-category"),
    ])
      .then(([s, l, e, x, c]) => {
        setSummary(s.data);
        setLowStock(l.data);
        setExpiring(e.data);
        setExpired(x.data);
        setSpending(c.data);
      })
      .catch(() => showError("Failed to load dashboard data."))
      .finally(() => setIsLoading(false));
  }, []);

  const groupedExpiring = useMemo(() => groupByItem(expiring), [expiring]);
  const groupedExpired = useMemo(() => groupByItem(expired), [expired]);

  return (
    <Box>
      {/* Row 1 — summary stats */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={4}>
          <StatCard
            label="Total Spent"
            value={money(summary?.totalSpent ?? 0)}
          />
        </Grid>
        <Grid size={4}>
          <StatCard
            label="Current Stock Value"
            value={money(summary?.currentStockValue ?? 0)}
            tone="success"
          />
        </Grid>
        <Grid size={4}>
          <StatCard
            label="Wasted Value"
            value={money(summary?.wasteValue ?? 0)}
            tone="error"
          />
        </Grid>
      </Grid>

      {/* Row 2 — three list cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={4}>
          <ListCard title="Low Stock" accent="#C2570A">
            {lowStock.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing low right now.
              </Typography>
            ) : (
              lowStock.map((i) => (
                <Box key={i.itemId} sx={rowSx}>
                  <Typography
                    variant="body2"
                    sx={{
                      flexGrow: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {i.name} {i.brandName ? `(${i.brandName})` : ""}
                  </Typography>
                  <Typography
                    sx={{ ...numSx, flexShrink: 0 }}
                    color="warning.main"
                  >
                    {i.currentQuantity}/{i.threshold} {i.unitOfMeasure}
                  </Typography>
                </Box>
              ))
            )}
          </ListCard>
        </Grid>

        <Grid size={4}>
          <ListCard title="Expiring Soon" accent="#C2570A">
            {groupedExpiring.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing expiring in 7 days.
              </Typography>
            ) : (
              <GroupedBatchList
                groups={groupedExpiring}
                dateColor="warning.main"
              />
            )}
          </ListCard>
        </Grid>

        <Grid size={4}>
          <ListCard title="Expired" accent="#A32C1F">
            {groupedExpired.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing expired in stock.
              </Typography>
            ) : (
              <GroupedBatchList
                groups={groupedExpired}
                dateColor="error.main"
              />
            )}
          </ListCard>
        </Grid>
      </Grid>

      {/* Row 3 — full-width chart */}
      <Grid container spacing={2}>
        <Grid size={12}>
          <ListCard title="Spending by Category" accent="#0E1B33" height={360}>
            {spending.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No purchases yet.
              </Typography>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spending}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#EFF1F6"
                  />
                  <XAxis
                    dataKey="categoryName"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip
                    formatter={(value) => money(Number(value ?? 0))}
                    contentStyle={{ fontSize: 12, fontFamily: "Inter" }}
                  />
                  <Bar
                    dataKey="totalSpent"
                    fill="#0E1B33"
                    radius={[3, 3, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ListCard>
        </Grid>
      </Grid>
    </Box>
  );
}
