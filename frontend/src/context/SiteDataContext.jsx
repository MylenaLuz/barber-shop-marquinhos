import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SettingsAPI, BarbersAPI, ServicesAPI } from "../services/resources";

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const [s, b, sv] = await Promise.all([SettingsAPI.get(), BarbersAPI.list(), ServicesAPI.list()]);
    setSettings(s);
    setBarbers(b);
    setServices(sv);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const getBarberName = useCallback((id) => barbers.find((b) => b.id === id)?.name || id, [barbers]);
  const getServiceName = useCallback((id) => services.find((s) => s.id === id)?.name || "—", [services]);

  return (
    <SiteDataContext.Provider value={{ settings, barbers, services, loading, reload, getBarberName, getServiceName }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData precisa estar dentro de <SiteDataProvider>");
  return ctx;
}
