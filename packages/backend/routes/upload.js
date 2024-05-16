const express = require('express');
const multer = require('multer');
const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed!'), false);
        }
    }
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded or incorrect file type.' });
        }

        const csvFilePath = path.join(__dirname, '..', req.file.path);
        const jsonArray = await csv().fromFile(csvFilePath);

        const jsonFilePath = path.join(__dirname, '..', 'uploads', 'data.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));

        fs.unlinkSync(csvFilePath); // Remove the CSV file after processing

        res.status(200).json({ status: 'success', message: 'File uploaded and processed successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'An error occurred while processing the file.' });
    }
});

module.exports = router;
