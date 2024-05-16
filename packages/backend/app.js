const express = require('express');
const multer = require('multer');
const csvtojson = require('csvtojson');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de cors
app.use(cors());

// Configuración de multer para gestionar la carga de archivos CSV
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed.'));
        }
    }
});

// Endpoint para cargar un archivo CSV
app.post('/upload', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded.');
        }

        const csvFilePath = path.join(__dirname, req.file.path);
        const jsonArray = await csvtojson().fromFile(csvFilePath);

        const jsonFilePath = path.join(__dirname, 'uploads', 'data.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));

        fs.unlinkSync(csvFilePath); // Eliminar el archivo CSV después de procesarlo

        res.status(200).json({ status: 'success', message: 'File uploaded and processed successfully.' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
