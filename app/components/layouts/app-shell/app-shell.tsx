import { Outlet } from "react-router";
import DockNavigation from "~/components/ui/Dock/Dock";
import { DockProvider } from "~/utils/DockContext";

export default function AppShellLayout() {
  return (
    <DockProvider>
      <DockNavigation />
      <Outlet />
    </DockProvider>
  );
}
