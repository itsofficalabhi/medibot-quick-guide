const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.storagePath = process.env.PDF_STORAGE_PATH || '/tmp/pdfs';
    this.ensureStorageDirectory();
  }

  ensureStorageDirectory() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async generateMedicalRecord(patientData, prescriptions, appointments) {
    const fileName = `medical_record_${patientData._id}_${Date.now()}.pdf`;
    const filePath = path.join(this.storagePath, fileName);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Add header
        doc.fontSize(20).text('Medical Record', { align: 'center' });
        doc.moveDown();

        // Patient Information
        doc.fontSize(16).text('Patient Information');
        doc.fontSize(12)
          .text(`Name: ${patientData.name}`)
          .text(`Email: ${patientData.email}`)
          .text(`Created: ${patientData.createdAt}`);
        doc.moveDown();

        // Prescriptions
        doc.fontSize(16).text('Prescriptions');
        prescriptions.forEach(prescription => {
          doc.fontSize(12)
            .text(`Date: ${prescription.date}`)
            .text(`Diagnosis: ${prescription.diagnosis}`)
            .text(`Medicines: ${prescription.medicines.map(m => m.name).join(', ')}`)
            .moveDown();
        });

        // Appointments
        doc.fontSize(16).text('Appointment History');
        appointments.forEach(appointment => {
          doc.fontSize(12)
            .text(`Date: ${appointment.date}`)
            .text(`Type: ${appointment.type}`)
            .text(`Status: ${appointment.status}`)
            .moveDown();
        });

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFGenerator();