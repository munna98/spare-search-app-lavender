import path from 'path';
import { fileURLToPath } from 'url';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import isDev from 'electron-is-dev';
import Database from 'better-sqlite3';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let db;

// Initialize or connect to database
function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'parts.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      part_number TEXT,
      description TEXT,
      price REAL DEFAULT 0,
      price_vat REAL DEFAULT 0
    )
  `);

  console.log(`Database initialized at: ${dbPath}`);
}

// Import data from Excel into SQLite


// async function importExcelToDatabase(filePath) {
//   const workbook = xlsx.readFile(filePath);
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];


//   const data = xlsx.utils.sheet_to_json(sheet);

//   const insert = db.prepare(
//     'INSERT INTO parts (part_number, description, price, price_vat) VALUES (?, ?, ?, ?)'
//   );
//   const insertMany = db.transaction((rows) => {
//     let importCount = 0;
//     for (const row of rows) {
//       const partNumber = row['Part Number'] || row['part_number'] || row['partNumber'] || row['MATERIAL NUMBER'];
//       const description = row['Description'] || row['description'] || row['MATERIAL DESCRIPTION'];
//       // const brand = row['Brand'] || row['brand'];
//       // const price = row['Price'] || row['price'] ||row['RETAIL PRICE'];
//       // const price_vat = row['Price Vat'] || row['price_vat'] ||row['RETAIL PRICE (INC. VAT)'];
//       const price = parseFloat(
//         row['RETAIL PRICE'] || row['Price'] || row['price'] || 0
//       );
//       const price_vat = parseFloat(
//         row['Price Vat'] || row['price_vat'] || row['RETAIL PRICE (INC. VAT)'] || 0
//       );

//        // Debug info
//       console.log(`Importing: ${partNumber}, Price: ${price}, Type: ${typeof price}`);
      
//       if (partNumber && description) {
//         insert.run(partNumber, description, price, price_vat);
//         importCount++;
//       }
//     }
//     return importCount;
//   });

//   try {
//     const count = insertMany(data);
//     return {
//       success: true,
//       message: `Imported ${count} parts successfully`,
//     };
//   } catch (error) {
//     return { success: false, message: error.message };
//   }
// }

async function importExcelToDatabase(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Get the range of the sheet to determine where actual data starts
  const range = xlsx.utils.decode_range(sheet['!ref']);
  
  // Define header row (second row in your case, index 1)
  const headerRowIndex = 1;
  
  // Extract headers from the second row
  const headers = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = xlsx.utils.encode_cell({ r: headerRowIndex, c: C });
    if (sheet[cellAddress]) {
      headers[C] = sheet[cellAddress].v;
    }
  }
  
  // Convert sheet to JSON starting from row after headers (third row)
  const data = [];
  for (let R = headerRowIndex + 1; R <= range.e.r; ++R) {
    const row = {};
    let hasData = false;
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
      if (sheet[cellAddress] && headers[C]) {
        row[headers[C]] = sheet[cellAddress].v;
        hasData = true;
      }
    }
    
    if (hasData) {
      data.push(row);
    }
  }

  const insert = db.prepare(
    'INSERT INTO parts (part_number, description, price, price_vat) VALUES (?, ?, ?, ?)'
  );
  
  const insertMany = db.transaction((rows) => {
    let importCount = 0;
    for (const row of rows) {
      const partNumber = row['MATERIAL NUMBER'];
      const description = row['MATERIAL DESCRIPTION'];
      
      // Parse prices, ensuring they're valid numbers
      let price = 0;
      let price_vat = 0;
      
      if (row['RETAIL PRICE'] !== undefined) {
        price = parseFloat(row['RETAIL PRICE']) || 0;
      }
      
      if (row['RETAIL PRICE (INC. VAT)'] !== undefined) {
        price_vat = parseFloat(row['RETAIL PRICE (INC. VAT)']) || 0;
      }

      // Debug info
      console.log(`Importing: ${partNumber}, Description: ${description}, Price: ${price}, Price VAT: ${price_vat}`);
      
      if (partNumber && description) {
        insert.run(partNumber, description, price, price_vat);
        importCount++;
      }
    }
    return importCount;
  });

  try {
    const count = insertMany(data);
    return {
      success: true,
      message: `Imported ${count} parts successfully`,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Create window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// App lifecycle
app.whenReady().then(() => {
  initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.close();
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }],
    properties: ['openFile'],
  });

  if (canceled) return { success: false };
  return { success: true, filePath: filePaths[0] };
});

ipcMain.handle('db:importFile', async (event, filePath) => {
  try {
    const result = await importExcelToDatabase(filePath);
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('db:searchParts', async (event, searchParams) => {
  const { term, mode = 'contains' } = searchParams;

  let query;
  let partCondition = 'part_number LIKE ?';

  switch (mode) {
    case 'startsWith':
      query = `${term}%`;
      break;
    case 'endsWith':
      query = `%${term}`;
      break;
    case 'exact':
      partCondition = 'part_number = ?';
      query = term;
      break;
    case 'contains':
    default:
      query = `%${term}%`;
      break;
  }

  try {
    const sql = `
      SELECT * FROM parts
      WHERE ${partCondition}
      LIMIT 100
    `;
    const rows = db.prepare(sql).all(query);

    const formattedResults = rows.map(row => ({
      id: row.id,
      partNumber: row.part_number,
      description: row.description,
      // brand: row.brand,
      price: row.price || 1,
      price_vat: row.price_vat || 0,
    }));

    return { success: true, results: formattedResults };
  } catch (err) {
    return { success: false, message: err.message };
  }
});