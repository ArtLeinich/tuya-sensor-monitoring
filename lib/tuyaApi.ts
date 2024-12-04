// lib/tuyaApi.ts
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";

// Lädt die Umgebungsvariablen aus der .env-Datei
dotenv.config();

// Überprüfung, ob alle erforderlichen Umgebungsvariablen gesetzt sind
const accessKey = process.env.TUYA_ACCESS_KEY;
const secretKey = process.env.TUYA_SECRET_KEY;
const deviceId = process.env.TUYA_DEVICE_ID;

if (!accessKey || !secretKey || !deviceId) {
  throw new Error('Erforderliche Umgebungsvariablen fehlen');
}

// Konfiguration mit den Umgebungsvariablen
const config = {
  host: 'https://openapi.tuyaeu.com',
  accessKey,  // Bereits auf undefined überprüft
  secretKey, 
  deviceId    
};

// Funktion zur Verschlüsselung des Strings mit dem Secret Key
const encryptStr = (signStr: string, secretKey: string): string => {
  return crypto.createHmac('sha256', secretKey).update(signStr).digest('hex').toUpperCase();
};

// Funktion, um das Zugriffstoken von Tuya zu erhalten
export const getToken = async (): Promise<string> => {
  const method = 'GET';
  const timestamp = Date.now().toString();
  const signUrl = '/v1.0/token?grant_type=1';
  const contentHash = crypto.createHash('sha256').update('').digest('hex');
  const stringToSign = `${method}\n${contentHash}\n\n${signUrl}`;
  const signStr = config.accessKey + timestamp + stringToSign;
  const sign = encryptStr(signStr, config.secretKey);

  // Header für die Anfrage
  const headers = {
    t: timestamp,
    sign_method: 'HMAC-SHA256',
    client_id: config.accessKey,
    sign
  };

  const url = `${config.host}${signUrl}`;
  const response = await axios.get(url, { headers });
  if (response.data.success) {
    return response.data.result.access_token;
  } else {
    throw new Error(`Fehler beim Abrufen des Tokens: ${response.data.msg}`);
  }
};

// Funktion, um den Status eines Geräts abzurufen
export const getDeviceStatus = async (token: string) => {
  const method = 'GET';
  const timestamp = Date.now().toString();
  const urlPath = `/v1.0/devices/${config.deviceId}/status`;

  const contentHash = crypto.createHash('sha256').update('').digest('hex');
  const stringToSign = `${method}\n${contentHash}\n\n${urlPath}`;
  const signStr = config.accessKey + token + timestamp + stringToSign;
  const sign = encryptStr(signStr, config.secretKey);

  // Header für die Geräte-Status-Anfrage
  const headers = {
    sign_method: 'HMAC-SHA256',
    client_id: config.accessKey,
    t: timestamp,
    'Content-Type': 'application/json',
    sign,
    access_token: token
  };

  const url = `${config.host}${urlPath}`;
  const response = await axios.get(url, { headers });

  if (response.data.success) {
    return response.data.result;
  } else {
    throw new Error(`Fehler beim Abrufen des Gerätestatus: ${response.data.msg}`);
  }
};
