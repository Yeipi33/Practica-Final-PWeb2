import mongoose from 'mongoose'

const workerSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  hours: { type: Number, required: true, min: 0 }
}, { _id: false })

const deliveryNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  client:      { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  format:      { type: String, enum: ['material', 'hours'], required: true },
  description: { type: String },
  workDate:    { type: Date, required: true },
  //material
  material:    { type: String },
  quantity:    { type: Number, min: 0 },
  unit:        { type: String },
  //horas
  hours:       { type: Number, min: 0 },
  workers:     [workerSchema],
  //firma
  signed:       { type: Boolean, default: false },
  signedAt:     { type: Date },
  signatureUrl: { type: String },
  pdfUrl:       { type: String },
  deleted:      { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('DeliveryNote', deliveryNoteSchema)