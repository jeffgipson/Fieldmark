import { useCallback, useEffect, useMemo, useState } from "react";
import * as vendorsApi from "../api/vendors";

export default function useVendorFavorites() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const contactByVendorId = useMemo(
    () => Object.fromEntries(contacts.map((c) => [c.vendor.id, c])),
    [contacts]
  );

  const favoriteIds = useMemo(
    () => new Set(contacts.map((c) => c.vendor.id)),
    [contacts]
  );

  const refresh = useCallback(async () => {
    const list = await vendorsApi.listVendorContacts();
    setContacts(list);
    return list;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    vendorsApi
      .listVendorContacts()
      .then((list) => {
        if (!cancelled) setContacts(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback((vendorId) => favoriteIds.has(vendorId), [favoriteIds]);

  const toggleFavorite = useCallback(
    async (vendorId) => {
      const existing = contactByVendorId[vendorId];
      if (existing) {
        await vendorsApi.unfavoriteVendor(vendorId);
        setContacts((prev) => prev.filter((c) => c.vendor.id !== vendorId));
        return false;
      }
      const created = await vendorsApi.saveVendorContact(vendorId);
      setContacts((prev) => [created, ...prev.filter((c) => c.vendor.id !== vendorId)]);
      return true;
    },
    [contactByVendorId]
  );

  return {
    contacts,
    contactByVendorId,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    refresh,
    loading
  };
}
