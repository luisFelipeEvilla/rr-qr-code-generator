const express = require("express");
const qrCode = require("qrcode");
const stream = require("stream");
const qr = require("qr-image");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const app = express();

// app.get('/', async (req, res) => {
//    // generate a QR code
//    const url = 'https://inventario-v2.mrconsulting.com.co/fichatecnica/generate?codigo=4196';
//    const qrCodeImage = await qrCode.toDataURL(url);
//     res.send(`<img src="${qrCodeImage}" alt="QR Code"/>`)
// });

app.get("/", (req, res) => {
  // obtener search params;
  const { codigo, consecutivo } = req.query;

  // Generar el código QR
  const qr_png = qr.imageSync(
    `https://inventario-v2.mrconsulting.com.co/fichatecnica/generate?codigo=${consecutivo}`,
    { type: "png" }
  );

  // Crear un nuevo documento PDF
  const doc = new PDFDocument();
  const outputFilename = `${consecutivo}-${codigo}.pdf`;

  // Stream del PDF hacia la respuesta HTTP
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${outputFilename}"`
  );
  doc.pipe(res);

  // Insertar el código QR en el PDF
  doc.image(qr_png, { fit: [250, 250] });

  // Finalizar el documento PDF
  doc.end();
});

app.get("/generate", async (req, res) => {
  // obtener search params;
  let { cliente, consecutivo, inicio, fin } = req.query;
  // Verificar que los parámetros de inicio y fin sean números enteros
  if (!Number.isInteger(Number(inicio)) || !Number.isInteger(Number(fin))) {
    res
      .status(400)
      .send("Los parámetros de inicio y fin deben ser números enteros");
    return;
  }

  if (!cliente || cliente === "") {
    res.status(400).send("El parámetro de cliente es requerido");
    return;
  }

  if (!consecutivo || consecutivo === "") {
    res.status(400).send("El parámetro de consecutivo es requerido");
    return;
  }

  inicio = parseInt(inicio);
  fin = parseInt(fin);

  // Verificar que el valor de inicio sea menor o igual al valor de fin
  if (inicio > fin) {
    res
      .status(400)
      .send("El valor de inicio debe ser menor o igual al valor de fin");
    return;
  }

  // Crear un nuevo documento PDF
  const doc = new PDFDocument();
  const outputFilename = `${consecutivo}-${inicio}-${fin}.pdf`;

  // Stream del PDF hacia la respuesta HTTP
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${outputFilename}.pdf"`
  );
  doc.pipe(res);
  // Generar los códigos QR y agregarlos al PDF
  const imageSize = 250;

  for (let i = inicio; i <= fin; i++) {
    const url = `https://inventario-v2.mrconsulting.com.co/fichatecnica/generate?codigo=${i}`;
    const qrCodeImage = await qrCode.toDataURL(url);
    doc.image(qrCodeImage, doc.page.width / 2 - imageSize / 2, doc.y, {
      fit: [250, 250],
    });
    // doc.font("Helvetica").fontSize(12);
    // doc.text(`Producto ${i}`, 10, 10);
    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("Escanéame", 80, 315, { align: "center" });
    doc.font("Helvetica").fontSize(20);
    doc.text(`${cliente}`, 80, 345, { align: "center" });
    doc.text(`${consecutivo}-${i}`, 80, 375, { align: "center" });

    if (i < fin) doc.addPage();
  }

  // Finalizar el documento PDF
  doc.end();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
