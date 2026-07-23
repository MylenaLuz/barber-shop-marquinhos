import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "28px 34px", maxWidth: 1400, width: "100%" }} className="admin-main">
        <Outlet />
      </main>
      <style>{`
        @media (max-width: 980px){ .admin-main{ padding:70px 16px 28px !important; } }
      `}</style>
    </div>
  );
}
