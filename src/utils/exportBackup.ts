import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type {
  CheckinRecord,
  MindDumpEntry,
  UserProfile,
} from "../types";

export interface ExportPayload {
  exportedAt: string;
  schemaVersion: 1;
  profile: UserProfile;
  checkins: CheckinRecord[];
  mindDumps: MindDumpEntry[];
}

export async function shareAppDataBackup(payload: ExportPayload): Promise<void> {
  const json = JSON.stringify(payload, null, 2);
  const name = `kimlik-yedek-${payload.exportedAt.slice(0, 10)}.json`;
  const base = FileSystem.cacheDirectory ?? "";
  const path = `${base}${name}`;
  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Paylaşım bu cihazda kullanılamıyor.");
  }
  await Sharing.shareAsync(path, {
    mimeType: "application/json",
    dialogTitle: "Kimlik yedeğini paylaş",
  });
}
