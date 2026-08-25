import apiClient from "@/api/client";
import { useLoading } from "@/context/LoadingContext";
import { useSnackbar } from "@/context/SnackbarContext";
import type { Batche } from "@/interfaces/IBatches";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  type ChipPropsColorOverrides,
} from "@mui/material";
import type { OverridableStringUnion } from "@mui/types";
import { useEffect, useState } from "react";

type StatusColor =
  | OverridableStringUnion<
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning",
      ChipPropsColorOverrides
    >
  | undefined;

export function BatchComponent({ itemId }: { itemId: number }) {
  const [batches, setBatches] = useState<Batche[]>([]);
  const { setIsLoading } = useLoading();
  const { showError } = useSnackbar();

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get(`/items/${itemId}/batches`)
      .then((res) => setBatches(res.data))
      .catch(() => showError("Failed to load Batches."))
      .finally(() => setIsLoading(false));
  }, [itemId]);

  function daysUntil(dateStr?: string): number | null {
    if (!dateStr) return null;
    return Math.ceil(
      (new Date(dateStr).getTime() - new Date().getTime()) / 86400000,
    );
  }

  function batchStatus(days: number | null): {
    label: string;
    color: StatusColor;
    bg: string | undefined;
  } {
    // Use `=== null` (not `!days`) so a batch expiring TODAY (days === 0)
    // doesn't get misread as "No Expiration".
    if (days === null)
      return { label: "No Expiration", color: "default", bg: undefined };
    if (days < 0) return { label: "Expired", color: "default", bg: undefined };
    if (days < 14)
      return { label: `${days}d left`, color: "error", bg: "error" };
    if (days < 60)
      return { label: `${days}d left`, color: "warning", bg: "warning" };
    return { label: "Fresh", color: "success", bg: undefined };
  }

  const totalRemaining = batches.reduce(
    (s, b) => s + (Number(b.remainingQuantity) || 0),
    0,
  );
  const totalOriginal = batches.reduce((s, b) => s + b.purchasedQuantity, 0);
  const stockPct =
    totalOriginal > 0 ? (totalRemaining / totalOriginal) * 100 : 0;

  const sorted = [...batches].sort((a, b) => {
    if (!a.expirationDate && !b.expirationDate) return 0;
    if (!a.expirationDate) return 1;
    if (!b.expirationDate) return -1;
    return (
      new Date(a.expirationDate).getTime() -
      new Date(b.expirationDate).getTime()
    );
  });

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "action.hover",
          borderRadius: 2,
          px: 2,
          py: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total stock
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {totalRemaining}{" "}
            <Typography component="span" color="text.secondary">
              / {totalOriginal}
            </Typography>
          </Typography>
        </Box>
        <Box sx={{ width: 150 }}>
          <LinearProgress
            variant="determinate"
            value={stockPct}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", textAlign: "right", mt: 0.5 }}
          >
            {batches.length} {batches.length === 1 ? "batch" : "batches"}
          </Typography>
        </Box>
      </Stack>

      {batches.length === 0 ? (
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            borderStyle: "dashed",
            py: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No batches yet for this item.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            border: 1,
            maxHeight: 320,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            overflowY: "auto",
          }}
        >
          {/* Column header */}
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              px: 2,
              py: 1,
              bgcolor: "background.paper",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, width: "34%" }}
            >
              Quantity
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, width: "33%" }}
            >
              Created
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, width: "33%", textAlign: "right" }}
            >
              Expires
            </Typography>
          </Stack>

          {sorted.map((batch, i) => {
            const days = daysUntil(batch.expirationDate);
            const status = batchStatus(days);
            return (
              <Stack
                key={batch.id}
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1.2,
                  bgcolor: status.bg
                    ? (theme) =>
                        alpha(
                          theme.palette[status.bg as "error" | "warning"].main,
                          0.08,
                        )
                    : "transparent",
                  borderTop: i > 0 ? 1 : 0,
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ width: "34%" }}>
                  {batch.remainingQuantity}
                  <Typography component="span" color="text.secondary">
                    {" "}
                    / {batch.purchasedQuantity}
                  </Typography>
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: "33%" }}
                >
                  {batch.purchaseDate
                    ? new Date(batch.purchaseDate).toLocaleDateString()
                    : "—"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    width: "33%",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {batch.expirationDate && (
                    <Typography variant="body2" color="text.secondary">
                      {new Date(batch.expirationDate).toLocaleDateString()}
                    </Typography>
                  )}
                  <Chip
                    size="small"
                    label={status.label}
                    color={status.color}
                  />
                </Stack>
              </Stack>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
