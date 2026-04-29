import React, { useEffect, useState } from "react";
import {
  Modal, View, Text, Pressable, FlatList,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOutfitsStore } from "@/store/outfits";
import type { WearLog } from "@/types";

const BG = "#0A0A0A";
const SURFACE = "#1A1A1A";
const SURFACE2 = "#2A2A2A";
const ACCENT = "#D4A574";
const TEXT = "#FFFFFF";
const TEXT_SEC = "#888888";
const TEXT_MUTED = "#555555";

interface Props {
  visible: boolean;
  outfitId: string;
  outfitName: string;
  onClose: () => void;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00"); // force local-time parse
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function WearHistorySheet({ visible, outfitId, outfitName, onClose }: Props) {
  const { fetchWearLogs, wearLogsBySavedOutfit, wearLogsLoading } = useOutfitsStore();
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!visible || !outfitId) return;
    setFetchError(false);
    fetchWearLogs(outfitId).catch(() => setFetchError(true));
  }, [visible, outfitId]);

  const logs: WearLog[] = wearLogsBySavedOutfit[outfitId] || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.sheetLabel}>WEAR HISTORY</Text>
              <Text style={s.sheetTitle} numberOfLines={1}>{outfitName}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
              <Ionicons name="close" size={20} color={TEXT_SEC} />
            </Pressable>
          </View>

          <View style={s.divider} />

          {wearLogsLoading ? (
            <ActivityIndicator color={ACCENT} style={{ marginTop: 32 }} />
          ) : fetchError ? (
            <Text style={s.emptyText}>Couldn't load history.</Text>
          ) : logs.length === 0 ? (
            <Text style={s.emptyText}>No wear history yet.</Text>
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <View style={s.logRow}>
                  <Ionicons name="calendar-outline" size={14} color={ACCENT} style={{ marginTop: 2 }} />
                  <Text style={s.logDate}>{formatDate(item.worn_on)}</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    minHeight: 280,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetLabel: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: ACCENT,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: "Fraunces_400Regular",
    fontSize: 20,
    color: TEXT,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: SURFACE2,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: SURFACE2,
    marginBottom: 16,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SURFACE2,
  },
  logDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: TEXT_SEC,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 32,
  },
});
