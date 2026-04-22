import PDFDocument from 'pdfkit';

export const generateDeliveryNotePdf = (deliveryNote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const chunks = []

    doc.on('data',chunk => chunks.push(chunk))
    doc.on('end',() => resolve(Buffer.concat(chunks)))
    doc.on('error', err => reject(err))

    //cabecera
    doc.fontSize(20).font('Helvetica-Bold').text('ALBARÁN', { align: 'center' })
    doc.moveDown()

    //datos empresa y usuario
    doc.fontSize(12).font('Helvetica-Bold').text('Datos del emisor')
    doc.font('Helvetica')
    if (deliveryNote.user) {
      doc.text(`Nombre: ${deliveryNote.user.name || ''}`)
      doc.text(`Email:  ${deliveryNote.user.email || ''}`)
    }
    doc.moveDown()

    //datos del cliente
    doc.font('Helvetica-Bold').text('Cliente')
    doc.font('Helvetica')
    if (deliveryNote.client) {
      doc.text(`Nombre: ${deliveryNote.client.name}`)
      doc.text(`CIF: ${deliveryNote.client.cif}`)
      if (deliveryNote.client.email) doc.text(`Email: ${deliveryNote.client.email}`)
      if (deliveryNote.client.phone) doc.text(`Teléfono: ${deliveryNote.client.phone}`)
    }
    doc.moveDown()

    //datos del proyecto
    doc.font('Helvetica-Bold').text('Proyecto')
    doc.font('Helvetica')
    if (deliveryNote.project) {
      doc.text(`Nombre:  ${deliveryNote.project.name}`)
      doc.text(`Código:  ${deliveryNote.project.projectCode}`)
      if (deliveryNote.project.notes) doc.text(`Notas: ${deliveryNote.project.notes}`)
    }
    doc.moveDown()

    //datos del albarán
    doc.font('Helvetica-Bold').text('Detalle del albarán')
    doc.font('Helvetica')
    doc.text(`Fecha de trabajo: ${new Date(deliveryNote.workDate).toLocaleDateString('es-ES')}`)
    doc.text(`Tipo: ${deliveryNote.format === 'hours' ? 'Horas' : 'Material'}`)
    if (deliveryNote.description) doc.text(`Descripción: ${deliveryNote.description}`)
    doc.moveDown()

    if (deliveryNote.format === 'material') {
      doc.font('Helvetica-Bold').text('Material')
      doc.font('Helvetica')
      doc.text(`Material: ${deliveryNote.material || ''}`)
      doc.text(`Cantidad: ${deliveryNote.quantity || ''} ${deliveryNote.unit || ''}`)
    }

    if (deliveryNote.format === 'hours') {
      doc.font('Helvetica-Bold').text('Horas')
      doc.font('Helvetica')
      if (deliveryNote.hours) {
        doc.text(`Total de horas: ${deliveryNote.hours}`)
      }
      if (deliveryNote.workers && deliveryNote.workers.length > 0) {
        doc.moveDown()
        doc.font('Helvetica-Bold').text('Trabajadores')
        doc.font('Helvetica')
        deliveryNote.workers.forEach(w => {
          doc.text(`${w.name}: ${w.hours}h`)
        })
      }
    }

    doc.moveDown()

    //firma
    if (deliveryNote.signed && deliveryNote.signatureUrl) {
      doc.font('Helvetica-Bold').text('Firma')
      doc.font('Helvetica')
      doc.text(`Firmado el: ${new Date(deliveryNote.signedAt).toLocaleDateString('es-ES')}`)
      doc.moveDown()
      //insertar la imagen de la firma por url
      try {
        doc.image(deliveryNote.signatureUrl, { width: 200 })
      } catch (_) {
        doc.text('(Firma disponible en la URL adjunta)')
      }
    }
    doc.end()
  })
}