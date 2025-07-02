import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { KioskInterface } from "./components/KioskInterface";
import { POSInterface } from "./components/POSInterface";
import { AdminInterface } from "./components/AdminInterface";

export default function App() {
  const [activeView, setActiveView] = useState<"kiosk" | "pos" | "admin">("kiosk");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-primary">Kiosk & POS System</h2>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveView("kiosk")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeView === "kiosk"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Kiosk
            </button>
            <button
              onClick={() => setActiveView("pos")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeView === "pos"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              POS
            </button>
            <button
              onClick={() => setActiveView("admin")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeView === "admin"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </button>
          </nav>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content activeView={activeView} />
      </main>
      <Toaster />
    </div>
  );
}

function Content({ activeView }: { activeView: "kiosk" | "pos" | "admin" }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Authenticated>
        {activeView === "kiosk" && <KioskInterface />}
        {activeView === "pos" && <POSInterface />}
        {activeView === "admin" && <AdminInterface />}
      </Authenticated>
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kiosk & POS System
            </h1>
            <p className="text-gray-600">Sign in to access the system</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
