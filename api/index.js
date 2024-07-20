const express = require("express");
const qrCode = require("qrcode");
const PDFDocument = require("pdfkit");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("QR Generator service");
});

app.post("/", async (req, res) => {
  // obtener search params;
  let { cliente, consecutivo, inicio, fin } = req.body;
  // Verificar que los parámetros de inicio y fin sean números enteros
  // if (!Number.isInteger(Number(inicio)) || !Number.isInteger(Number(fin))) {
  //   res
  //     .status(400)
  //     .send("Los parámetros de inicio y fin deben ser números enteros");
  //   return;
  // }

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
  const imageSize = 60;

  for (let i = inicio; i <= fin; i++) {
    const url = `https://inventario-v2.mrconsulting.com.co/fichatecnica/generate?codigo=${i}`;
    const qrCodeImage = await qrCode.toDataURL(url);
    doc.image(qrCodeImage, doc.page.width / 2 - imageSize / 2, doc.y, {
      fit: [imageSize, imageSize],
    });
    // doc.font("Helvetica").fontSize(12);
    // doc.text(`Producto ${i}`, 10, 10);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Escanéame", imageSize + 10 , imageSize * 2 + 10, { align: "center" });
    doc.font("Helvetica").fontSize(10);
    doc.text(`${cliente}`, imageSize + 120, imageSize + 30, { align: "center" });
    doc.text(`${consecutivo}-${i}`, imageSize + 120, imageSize + 45, { align: "center" });

    if (i < fin) doc.addPage();
  }

  // Finalizar el documento PDF
  doc.end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
