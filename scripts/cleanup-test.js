// Cleanup test data from the Google Sheet
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function cleanup() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Clear data rows (keep headers) in all tabs
  const tabs = ['Agent Credentials', 'Leads', 'Meeting Requests'];
  for (const tab of tabs) {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `'${tab}'!A:Z`,
      });
      const rowCount = (res.data.values || []).length;
      if (rowCount > 1) {
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SHEET_ID,
          range: `'${tab}'!A2:Z${rowCount}`,
        });
        console.log(`Cleared ${rowCount - 1} data rows from: ${tab}`);
      } else {
        console.log(`No data to clear in: ${tab}`);
      }
    } catch (e) {
      console.log(`Error clearing ${tab}:`, e.message);
    }
  }

  console.log('Cleanup complete!');
}

cleanup().catch(console.error);
