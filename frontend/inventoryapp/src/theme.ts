import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    background: { default: "#F5F6FA", paper: "#FFFFFF" },
    primary: { main: "#0E1B33" },
    text: { primary: "#0E1B33", secondary: "#6B7280" },
    error: { main: "#A32C1F" },
    warning: { main: "#C2570A" },
    success: { main: "#1B7A4A" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h5: { fontFamily: "'Sora', sans-serif", fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.01em" },
    body2: { fontSize: "0.85rem" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid #E3E6EF", boxShadow: "none" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.7rem" },
      },
    },
  },
});