import fs from "fs/promises";
import path from "path";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.log("Error loading credentials:", err);
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
async function scheduleMeet(auth, email, email2, purpose, dateTime) {
  const calendar = google.calendar({ version: "v3", auth });

  const date = "2024-11-05"; // YYYY-MM-DD format
  const time = "10:00:00"; // HH:mm:ss format
  
  // Create a combined datetime string in UTC
  
  // Create a Date object in UTC
  const datetimeUTC = new Date(dateTime + 'Z'); // 'Z' indicates UTC
  
  // Add 1 hour
  const endUTC = new Date(datetimeUTC);
  endUTC.setHours(endUTC.getHours() + 1); // Add 1 hour
  
  // Format start and end dates in ISO format
  const startISO = datetimeUTC.toISOString(); // e.g. "2024-11-05T04:30:00.000Z" in UTC
  const endISO = endUTC.toISOString(); // e.g. "2024-11-05T05:30:00.000Z" in UTC
  

  const event = {
    summary: purpose,
    description: "Meeting with Psychologist",
    start: {
      dateTime: startISO,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: endISO,
      timeZone: "Asia/Kolkata",
    },
    conferenceData: {
      createRequest: {
        requestId: "some-random-string",
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    },
    attendees: [{ email: email }, { email: email2 }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 1440 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });
    console.log(`Event created: ${response.data.htmlLink}`);
    return response.data.htmlLink;
  } catch (error) {
    console.error("Error creating event:", error);
  }
}
export default async function main(email1, email2, purpose, dateTime) {
  const auth = await authorize();
  return await scheduleMeet(auth, email1, email2, purpose, dateTime);
}
