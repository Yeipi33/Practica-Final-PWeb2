import DeliveryNote from '../models/DeliveryNote.js'
import Project from '../models/Project.js'
import Client from '../models/Clients.js'
import {AppError} from '../utils/AppError.js'
import { uploadToCloudinary, uploadPdfToCloudinary } from '../services/storage.service.js'
import { generateDeliveryNotePdf } from '../services/pdf.service.js'
import { io } from '../app.js'

//patch /api/deliverynote/:id/sign
export const signDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
      .populate('user', 'name email')
      .populate('client', 'name cif email phone address')
      .populate('project', 'name projectCode notes')

    if (!deliveryNote) return next(new AppError('Albarán no encontrado', 404))
    if (deliveryNote.signed) return next(new AppError('Este albarán ya está firmado', 400))
    if (!req.file) return next(new AppError('Debes adjuntar la imagen de la firma', 400))

    const signatureResult = await uploadToCloudinary(
      req.file.buffer,
      'bildyapp/signatures',
      `signature_${deliveryNote._id}`
    )

    deliveryNote.signed = true
    deliveryNote.signedAt = new Date()
    deliveryNote.signatureUrl = signatureResult.secure_url

    const pdfBuffer = await generateDeliveryNotePdf(deliveryNote)

    const pdfResult = await uploadPdfToCloudinary(
      pdfBuffer,
      'bildyapp/pdfs',
      `deliverynote_${deliveryNote._id}`
    )

    deliveryNote.pdfUrl = pdfResult.secure_url
    await deliveryNote.save()

    io.to(`company:${company}`).emit('deliverynote:signed', { deliveryNote })

    res.json({ ok: true, message: 'Albarán firmado correctamente', deliveryNote })
  } catch (error) {
    next(error)
  }
}

//get /api/deliverynote/pdf/:id
export const downloadDeliveryNotePdf = async (req, res, next) => {
  try {
    const { company } = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
      .populate('user',    'name email')
      .populate('client',  'name cif email phone address')
      .populate('project', 'name projectCode notes')

    if (!deliveryNote) return next(new AppError('Albarán no encontrado', 404))

    if (deliveryNote.signed && deliveryNote.pdfUrl) {
      return res.redirect(deliveryNote.pdfUrl)
    }

    const pdfBuffer = await generateDeliveryNotePdf(deliveryNote)

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="albaran_${deliveryNote._id}.pdf"`,
      'Content-Length':      pdfBuffer.length
    })

    res.send(pdfBuffer)
  } catch (error) {
    next(error)
  }
}

//post /api/deliverynote
export const createDeliveryNote = async (req, res, next) => {
  try {
    const { _id: userId, company } = req.user

    if (!company) return next(new AppError('Debes tener una compañía asociada', 400))

    const project = await Project.findOne({ _id: req.body.project, company, deleted: false })
    if (!project) return next(new AppError('Proyecto no encontrado en tu compañía', 404))

    const client = await Client.findOne({ _id: req.body.client, company, deleted: false })
    if (!client) return next(new AppError('Cliente no encontrado en tu compañía', 404))

    const deliveryNote = await DeliveryNote.create({
      ...req.body,
      user: userId,
      company
    })

    io.to(`company:${company}`).emit('deliverynote:new', { deliveryNote })

    res.status(201).json({ ok: true, deliveryNote })
  } catch (error) {
    next(error)
  }
}

//get /api/deliverynote
export const getDeliveryNotes = async (req, res, next) => {
  try {
    const { company } = req.user
    const {
      page = 1,
      limit = 10,
      project,
      client,
      format,
      signed,
      from,
      to,
      sort = '-workDate'
    } = req.query

    const filter = { company, deleted: false }

    if (project) filter.project = project
    if (client)  filter.client  = client
    if (format)  filter.format  = format
    if (signed !== undefined) filter.signed = signed === 'true'
    if (from || to) {
      filter.workDate = {}
      if (from) filter.workDate.$gte = new Date(from)
      if (to)   filter.workDate.$lte = new Date(to)
    }

    const skip = (Number(page) - 1) * Number(limit)
    const totalItems = await DeliveryNote.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / Number(limit))

    const deliveryNotes = await DeliveryNote.find(filter)
      .populate('user',    'name email')
      .populate('client',  'name cif email')
      .populate('project', 'name projectCode')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    res.json({
      ok: true,
      deliveryNotes,
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

//get /api/deliverynote/:id
export const getDeliveryNoteById = async (req, res, next) => {
  try {
    const { company } = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
      .populate('user',    'name email')
      .populate('client',  'name cif email phone address')
      .populate('project', 'name projectCode address email notes')

    if (!deliveryNote) return next(new AppError('Albarán no encontrado', 404))

    res.json({ ok: true, deliveryNote })
  } catch (error) {
    next(error)
  }
}

//delete /api/deliverynote/:id
export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
    if (!deliveryNote) return next(new AppError('Albarán no encontrado', 404))

    // No se puede borrar si está firmado
    if (deliveryNote.signed) {
      return next(new AppError('No se puede eliminar un albarán firmado', 400))
    }

    await deliveryNote.deleteOne()
    res.json({ ok: true, message: 'Albarán eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}