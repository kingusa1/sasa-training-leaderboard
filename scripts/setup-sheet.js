// Script to set up Google Sheet tabs and headers
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

async function setup() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Setting up Google Sheet:', SHEET_ID);

  // First, get existing sheet info
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);
  console.log('Existing tabs:', existingSheets);

  // Tabs we need with new column structure
  const tabs = [
    {
      name: 'Agent Credentials',
      headers: ['AgentID', 'FullName', 'Email', 'Phone', 'HashedPassword', 'EmailPassword', 'EmailConnected', 'CreatedAt'],
    },
    {
      name: 'Leads',
      headers: [
        'Timestamp', 'AgentName', 'AgentEmail', 'FirstName', 'LastName',
        'ClientEmail', 'ClientPhone', 'Package', 'CompanyName', 'TeamSize',
        'PreferredContact', 'BestTime', 'Notes', 'MeetingDone', 'PaymentReceived',
        'Status', 'LeadSource',
      ],
    },
    {
      name: 'Meeting Requests',
      headers: [
        'Timestamp', 'AgentName', 'AgentEmail', 'ClientName', 'ClientEmail',
        'ClientPhone', 'PackageInterest', 'PreferredDate', 'PreferredTime',
        'MeetingType', 'Notes', 'Status',
      ],
    },
  ];

  // Create missing tabs
  const requests = [];
  for (const tab of tabs) {
    if (!existingSheets.includes(tab.name)) {
      requests.push({
        addSheet: {
          properties: { title: tab.name },
        },
      });
      console.log(`Will create tab: ${tab.name}`);
    } else {
      console.log(`Tab already exists: ${tab.name}`);
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    });
    console.log('Created new tabs');
  }

  // Add headers to each tab (overwrites row 1)
  for (const tab of tabs) {
    const endCol = String.fromCharCode(64 + tab.headers.length);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'${tab.name}'!A1:${endCol}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [tab.headers],
      },
    });
    console.log(`Set headers for: ${tab.name} (${tab.headers.length} columns)`);
  }

  // Delete default "Sheet1" if it exists and we have our tabs
  const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const allSheets = updatedSpreadsheet.data.sheets;
  const sheet1 = allSheets.find(s => s.properties.title === 'Sheet1');
  if (sheet1 && allSheets.length > 1) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            deleteSheet: { sheetId: sheet1.properties.sheetId }
          }]
        }
      });
      console.log('Deleted default Sheet1');
    } catch (e) {
      console.log('Could not delete Sheet1:', e.message);
    }
  }

  console.log('\nGoogle Sheet setup complete!');
  console.log('\nColumn structure:');
  for (const tab of tabs) {
    console.log(`\n${tab.name}:`);
    tab.headers.forEach((h, i) => console.log(`  Col ${String.fromCharCode(65 + i)} (${i}): ${h}`));
  }
}

setup().catch(console.error);
