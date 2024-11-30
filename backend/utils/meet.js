import fs from "fs/promises";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "./token.json"; // Path to store the access token if not using a cloud service

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
  const keys = JSON.parse(process.env.GOOGLE_CREDENTIALS);
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
  const client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  return client;
}
async function scheduleMeet(auth, email, email2, purpose, dateTime) {
  const calendar = google.calendar({ version: "v3", auth });

  const datetimeUTC = new Date(dateTime + 'Z'); 
  const endUTC = new Date(datetimeUTC);
  endUTC.setHours(endUTC.getHours() + 1);

  const startISO = datetimeUTC.toISOString();
  const endISO = endUTC.toISOString();

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
        requestId: "random-string",
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
