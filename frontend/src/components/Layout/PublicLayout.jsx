import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader />
      <Outlet />
    </div>
  );
}
