import mongoose from "mongoose";

const  addressSchema = new mongoose.Schema({
    street: { type: String },
    number: { type: String },
    postal: { type: String },
    city: { type: String },
    province: { type: String },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  client:      { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name:        { type: String, required: true, trim: true },
  projectCode: { type: String, required: true, trim: true },
  address:     addressSchema,
  email:       { type: String, trim: true, lowercase: true },
  notes:       { type: String },
  active:      { type: Boolean, default: true },
  deleted:     { type: Boolean, default: false }
}, {timestamps: true});

projectSchema.index({ projectCode: 1, company: 1 }, { unique: true });

export default mongoose.model('Project', projectSchema);