const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Excel file path
const EXCEL_FILE = path.join(__dirname, 'form-submissions.xlsx');

// Function to check if file is locked
function isFileLocked(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r+');
    fs.closeSync(fd);
    return false;
  } catch (err) {
    return err.code === 'EBUSY' || err.code === 'EPERM';
  }
}

// Function to write with retry
async function writeWithRetry(wb, filePath, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (!isFileLocked(filePath)) {
        XLSX.writeFile(wb, filePath);
        return true;
      }
      console.log(`File is locked, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      console.log(`Write failed, retrying... (${err.message})`);
    }
  }
  throw new Error('Max retries reached, could not write file');
}

// Function to read Excel file
function readExcelFile() {
  if (!fs.existsSync(EXCEL_FILE)) {
    const wb = XLSX.utils.book_new();
    const headers = ['timestamp', 'name', 'phone', 'email', 'message'];
    const ws = XLSX.utils.json_to_sheet([], { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    XLSX.writeFile(wb, EXCEL_FILE);
    return wb;
  }
  return XLSX.readFile(EXCEL_FILE);
}

// Function to write to Excel file
async function writeToExcel(data) {
  try {
    const wb = readExcelFile();
    const ws = wb.Sheets['Submissions'];
    
    const existingData = XLSX.utils.sheet_to_json(ws);
    
    const newEntry = {
      timestamp: new Date().toLocaleString('vi-VN'),
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      message: data.message || ''
    };
    
    existingData.push(newEntry);
    
    const newWs = XLSX.utils.json_to_sheet(existingData);
    wb.Sheets['Submissions'] = newWs;
    
    await writeWithRetry(wb, EXCEL_FILE);
    return existingData.length;
  } catch (error) {
    console.error('Error writing to Excel:', error);
    throw error;
  }
}

// Serve static files
app.use(express.static('public'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('formSubmission', async (data) => {
    console.log('Form data received:', data);
    try {
      const totalEntries = await writeToExcel(data);
      console.log(`Data saved successfully. Total entries: ${totalEntries}`);
      
      socket.emit('formSubmissionSuccess', {
        message: 'Thông tin đã được lưu thành công!',
        totalEntries
      });
    } catch (error) {
      console.error('Error saving data:', error);
      socket.emit('formSubmissionError', { 
        message: 'Không thể lưu thông tin. Vui lòng thử lại sau!' 
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});