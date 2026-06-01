import { useEffect, useState, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../api/firebase";

const LOCAL_KEY = (uid) => `zen_catalogues_${uid}`;

export function useCatalogue() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const migrated = useRef(false);

  useEffect(() => {
    if (!uid) {
      setCatalogues([]);
      setLoading(false);
      return;
    }

    migrated.current = false;
    const colRef = collection(db, "users", uid, "catalogues");

    const unsub = onSnapshot(colRef, (snap) => {
      const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));

      // One-time migration from localStorage on first server-confirmed snapshot
      if (!migrated.current && !snap.metadata.fromCache) {
        migrated.current = true;
        if (docs.length === 0) {
          const raw = localStorage.getItem(LOCAL_KEY(uid));
          if (raw) {
            try {
              const items = JSON.parse(raw);
              if (items.length > 0) {
                const batch = writeBatch(db);
                for (const cat of items) {
                  batch.set(doc(colRef, cat.id), cat);
                }
                batch.commit().then(() => localStorage.removeItem(LOCAL_KEY(uid)));
                return; // onSnapshot re-fires with migrated data
              }
            } catch { /* ignore */ }
          }
        }
        localStorage.removeItem(LOCAL_KEY(uid));
      }

      docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCatalogues(docs);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  const catDoc = (id) => doc(db, "users", uid, "catalogues", id);

  const getAll = () => catalogues;

  const createCatalogue = ({ skillName, educators, videos }) => {
    const id = `cat_${Date.now()}`;
    const cat = {
      id,
      skillName,
      skillSlug: skillName.toLowerCase().replace(/\W+/g, "_"),
      educators,
      videos,
      pinnedVideoIds: [],
      removedVideoIds: [],
      customOrder: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (uid) setDoc(catDoc(id), cat);
    return cat;
  };

  const getCatalogue = (id) => catalogues.find((c) => c.id === id) || null;

  const deleteCatalogue = (id) => {
    if (uid) deleteDoc(catDoc(id));
  };

  const updateCatalogue = (id, updates) => {
    if (uid) updateDoc(catDoc(id), { ...updates, updatedAt: Date.now() });
  };

  const pinVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      pinnedVideoIds: [...new Set([videoId, ...cat.pinnedVideoIds])],
    });
  };

  const unpinVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      pinnedVideoIds: cat.pinnedVideoIds.filter((id) => id !== videoId),
    });
  };

  const removeVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      removedVideoIds: [...new Set([videoId, ...cat.removedVideoIds])],
    });
  };

  const restoreVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      removedVideoIds: cat.removedVideoIds.filter((id) => id !== videoId),
    });
  };

  const setCustomOrder = (catId, orderedIds) =>
    updateCatalogue(catId, { customOrder: orderedIds });

  const resetOrder = (catId) =>
    updateCatalogue(catId, { customOrder: null });

  const getDisplayVideos = (cat, sortMode = "relevancy") => {
    const { videos, pinnedVideoIds, removedVideoIds, customOrder } = cat;
    const active = videos.filter((v) => !removedVideoIds.includes(v.id));
    const pinned = pinnedVideoIds
      .map((id) => active.find((v) => v.id === id))
      .filter(Boolean);
    const rest = active.filter((v) => !pinnedVideoIds.includes(v.id));

    let orderedRest;
    if (customOrder) {
      const map = new Map(rest.map((v) => [v.id, v]));
      orderedRest = customOrder.map((id) => map.get(id)).filter(Boolean);
    } else if (sortMode === "newest") {
      orderedRest = [...rest].sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );
    } else if (sortMode === "views") {
      orderedRest = [...rest].sort(
        (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
      );
    } else {
      orderedRest = [...rest].sort(
        (a, b) => (b.relevancyScore || 0) - (a.relevancyScore || 0)
      );
    }

    return [...pinned, ...orderedRest];
  };

  return {
    catalogues,
    loading,
    getAll,
    createCatalogue,
    getCatalogue,
    updateCatalogue,
    deleteCatalogue,
    pinVideo,
    unpinVideo,
    removeVideo,
    restoreVideo,
    setCustomOrder,
    resetOrder,
    getDisplayVideos,
  };
}
