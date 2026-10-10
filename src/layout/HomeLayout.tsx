import { Outlet, useNavigate } from "react-router";
import { HomePageNav } from "../components/navigation/HomePageNav";
import { useCallback, useEffect, useState } from "react";
import HomeFooter from "../components/navigation/HomeFooter";
import Toast from "../components/Toast";
import { readStoredAuthSession } from "../services/authSession";
import { useLayoutMode } from "../context/LayoutContext";
import { LayoutProvider } from "../context/LayoutProvider";

function HomeLayoutInner() {
  const { headerMode, setHeaderMode } = useLayoutMode();

  //  NUEVOS ESTADOS PARA EL TOAST
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  //  FUNCIÓN PARA MOSTRAR TOAST
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "warning" | "info") => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
    },
    [],
  );

  //  FUNCIÓN PARA CERRAR TOAST
  const closeToast = () => {
    setShowToast(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const user = readStoredAuthSession();
    if (user && window.location.pathname === "/login") {
      try {
        if (user.token) {
          const timer = setTimeout(() => {
            if (window.location.pathname === "/login") {
              navigate("/reserve-pitch/");
            }
          }, 500);
          return () => clearTimeout(timer);
        }
      } catch {
        // Token inválido, no redirigir
      }
    }
  }, [navigate]);

  return (
    <section className="homeLayout">
      <HomePageNav
        showNotification={showNotification}
        simple={headerMode === "simple"}
      />
      <Outlet context={{ showNotification, setHeaderMode }} />
      <HomeFooter />
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={closeToast}
        duration={4000}
      />
    </section>
  );
}

export function HomeLayout() {
  return (
    <LayoutProvider>
      <HomeLayoutInner />
    </LayoutProvider>
  );
}
