// Google Apps Script untuk Dashboard
// Copy script ini ke Google Apps Script Editor

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil data dari setiap sheet
  const telur = ss.getSheetByName("TELUR_MASUK").getDataRange().getValues();
  const tetas = ss.getSheetByName("TETASAN").getDataRange().getValues();
  const jual = ss.getSheetByName("PENJUALAN").getDataRange().getValues();
  const keluar = ss.getSheetByName("PENGELUARAN").getDataRange().getValues();
  
  // Hapus header (baris pertama)
  telur.shift();
  tetas.shift();
  jual.shift();
  keluar.shift();
  
  // Return sebagai JSON
  const data = {
    telur: telur,
    tetas: tetas,
    jual: jual,
    keluar: keluar
  };
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(data.sheet);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Sheet tidak ditemukan: " + data.sheet
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Tambahkan data ke sheet
    sheet.appendRow(data.values);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
