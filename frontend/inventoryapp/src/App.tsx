import AppRoutes from "@/routes/AppRoutes"
import { SnackbarProvider } from "./context/SnackbarProvider"

function App() {
 return (
 <SnackbarProvider>
    <AppRoutes />
 </SnackbarProvider>
 );
}

export default App
