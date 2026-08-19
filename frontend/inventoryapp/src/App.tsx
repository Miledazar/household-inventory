
import MainLayout from "./layouts/MainLayout"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Items from "./pages/Items"
import Transactions from "./pages/Transactions"
import GroceryLists from "./pages/GroceryLists"
import Stores from "./pages/Stores"
import Brands from "./pages/Brands"
import Categories from "./pages/Categories"
import { Login } from "@mui/icons-material"



function App() {
 return <>
  <BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route path="/*" element ={
      <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/items" element={<Items/>}/>
        <Route path="/transactions" element={<Transactions/>}/>
        <Route path="/grocery-lists" element={<GroceryLists/>}/>
        <Route path="/stores" element={<Stores/>}/>
        <Route path="/brands" element={<Brands/>}/>
        <Route path="/categories" element={<Categories/>}/>
      </Routes>
    </MainLayout>
    }/>
    </Routes>
  </BrowserRouter>
 </>
}

export default App
