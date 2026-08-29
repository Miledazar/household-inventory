import AppRoutes from "@/routes/AppRoutes";
import { SnackbarProvider } from "./context/SnackbarProvider";
import { LoadingProvider } from "./context/LoadingProvider";

function App() {
  return (
    <LoadingProvider>
      <SnackbarProvider>
        <AppRoutes />
      </SnackbarProvider>
    </LoadingProvider>
  );
}

export default App;
