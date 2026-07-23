import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SiteDataProvider } from "./context/SiteDataContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Agenda from "./pages/admin/Agenda";
import Clientes from "./pages/admin/Clientes";
import Mensalistas from "./pages/admin/Mensalistas";
import Servicos from "./pages/admin/Servicos";
import Caixa from "./pages/admin/Caixa";
import Relatorios from "./pages/admin/Relatorios";
import Configuracoes from "./pages/admin/Configuracoes";

export default function App() {
  return (
    <AuthProvider>
      <SiteDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="mensalistas" element={<Mensalistas />} />
              <Route path="servicos" element={<Servicos />} />
              <Route path="caixa" element={<Caixa />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="configuracoes" element={<Configuracoes />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SiteDataProvider>
    </AuthProvider>
  );
}
