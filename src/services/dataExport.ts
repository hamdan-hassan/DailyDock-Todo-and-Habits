/**
 * DailyDock — Data Export/Import Service
 *
 * Handles JSON export and import of all app data.
 */

import { Share, Alert, Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { pick, types, isErrorWithCode, errorCodes, saveDocuments } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

interface ExportData {
  version: 2;
  exportDate: string;
  tasks: string | null;
  habits: string | null;
  settings: string | null;
}

interface SignedExport {
  signature: string;
  payload: ExportData;
}

/** Simple 53-bit string hash (cyrb53) for tamper prevention */
function generateSignature(payload: string): string {
  const SALT = "DailyDock_Secure_Backup_v1";
  const str = payload + SALT;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/** Export all app data as JSON string */
export function exportData(): string {
  const tasksStorage = createMMKV({ id: 'dailydock-tasks' });
  const habitsStorage = createMMKV({ id: 'dailydock-habits' });
  const settingsStorage = createMMKV({ id: 'dailydock-settings' });

  const data: ExportData = {
    version: 2,
    exportDate: new Date().toISOString(),
    tasks: tasksStorage.getString('tasks-store') ?? null,
    habits: habitsStorage.getString('habits-store') ?? null,
    settings: settingsStorage.getString('settings-store') ?? null,
  };

  const payloadString = JSON.stringify(data);
  const signature = generateSignature(payloadString);

  const signedData: SignedExport = {
    signature,
    payload: data,
  };

  return JSON.stringify(signedData, null, 2);
}

/** Share exported data via system share sheet as a file */
export async function shareExportedData(): Promise<void> {
  try {
    const data = exportData();
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `DailyDock_Backup_${dateStr}.json`;
    const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

    // Write JSON to a temporary file
    await RNFS.writeFile(filePath, data, 'utf8');

    // Share the file URL
    await Share.share({
      url: `file://${filePath}`,
      title: 'DailyDock Backup',
    });
  } catch (error) {
    console.error('[Export] Failed to share:', error);
    Alert.alert('Export Error', 'Failed to save or share the backup file.');
  }
}

/** Save exported data directly to the device storage */
export async function saveExportedDataToDevice(): Promise<boolean> {
  try {
    const data = exportData();
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `DailyDock_Backup_${dateStr}.json`;
    const tempPath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

    // Write JSON to a temporary file first
    await RNFS.writeFile(tempPath, data, 'utf8');

    // Prompt user to save the file using the native file picker
    await saveDocuments({
      sourceUris: [`file://${tempPath}`],
      fileName: fileName,
      mimeType: 'application/json',
      copy: true,
    });

    // Cleanup temp file
    await RNFS.unlink(tempPath).catch(() => {});
    return true;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      // User cancelled the save dialog, not an error
      return false;
    }
    console.error('[Export] Failed to save to device:', error);
    Alert.alert('Save Error', 'Failed to save the backup file to the device.');
    return false;
  }
}

/** Import data from JSON string */
export function importData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    
    let data: ExportData;
    
    // Check if it's a signed export
    if (parsed.signature && parsed.payload) {
      const payloadString = JSON.stringify(parsed.payload);
      const expectedSignature = generateSignature(payloadString);
      
      if (expectedSignature !== parsed.signature) {
        Alert.alert('Tampered File', 'This backup file has been modified or corrupted and cannot be imported.');
        return false;
      }
      data = parsed.payload;
    } else {
      // Reject legacy or unsigned files to strictly enforce anti-tampering
      Alert.alert('Import Error', 'Invalid backup format or missing signature.');
      return false;
    }

    if (data.version !== 2 && data.version !== 1) {
      Alert.alert('Import Error', 'Unsupported backup version.');
      return false;
    }

    const tasksStorage = createMMKV({ id: 'dailydock-tasks' });
    const habitsStorage = createMMKV({ id: 'dailydock-habits' });
    const settingsStorage = createMMKV({ id: 'dailydock-settings' });

    if (data.tasks) {
      tasksStorage.set('tasks-store', data.tasks);
    }
    if (data.habits) {
      habitsStorage.set('habits-store', data.habits);
    }
    if (data.settings) {
      settingsStorage.set('settings-store', data.settings);
    }

    return true;
  } catch (error) {
    console.error('[Import] Failed:', error);
    Alert.alert('Import Error', 'The file format is invalid.');
    return false;
  }
}

/** Pick a JSON file from device and import data */
export async function importDataFromFile(): Promise<boolean> {
  try {
    const [result] = await pick({
      type: [types.json, types.allFiles],
      allowMultiSelection: false,
    });

    // The picker provides a uri that RNFS can read natively
    const fileToRead = result.uri;
    
    // Convert 'file://' prefix to actual path for RNFS on Android, though RNFS often handles file:// natively
    // Read the file directly
    const fileContent = await RNFS.readFile(fileToRead, 'utf8');
    
    return importData(fileContent);
  } catch (err) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
      // User cancelled
      return false;
    }
    console.error('[Import] Error:', err);
    Alert.alert('Error', 'Failed to read backup file.');
    return false;
  }
}
