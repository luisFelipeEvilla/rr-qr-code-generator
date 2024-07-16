const express = require('express');
const qrCode = require('qrcode');
const stream = require('stream');
const qr = require('qr-image');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();

// app.get('/', async (req, res) => {
//    // generate a QR code
//    const url = 'https://inventario-v2.mrconsulting.com.co/fichatecnica/generate?codigo=4196';
//    const qrCodeImage = await qrCode.toDataURL(url);
//     res.send(`<img src="${qrCodeImage}" alt="QR Code"/>`)
// });

app.get('/', (req, res) => {
    // obtener search params;
    const { codigo, consecutivo } = req.query;

    // Generar el código QR
    const qr_png = qr.imageSync(`https://inventario-v2.mrconsulting.com.co/fichatecnica/generate?codigo=${consecutivo}`, { type: 'png' });

    // Crear un nuevo documento PDF
    const doc = new PDFDocument();
    const outputFilename = `${consecutivo}-${codigo}.pdf`;

    // Stream del PDF hacia la respuesta HTTP
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    doc.pipe(res);

    // Insertar el código QR en el PDF
    doc.image(qr_png, { fit: [250, 250] });

    // Finalizar el documento PDF
    doc.end();
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    }
);