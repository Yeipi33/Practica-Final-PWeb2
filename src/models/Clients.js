import mongoose from "mongoose";

const  addressSchema = new mongoose.Schema({
    street: { type: String, trim: true },
    number: { type: String, trim: true },
    postal: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
}, { _id: false });

const clientSchema = new moongose.Schema({
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name:    { type: String, required: true, trim: true },
  cif:     { type: String, required: true, trim: true, uppercase: true },
  email:   { type: String, trim: true, lowercase: true },
  phone:   { type: String, trim: true },
  address: addressSchema,
  deleted: { type: Boolean, default: false }
}, {timestamps: true});

clientSchema.index({ cif: 1, company: 1 }, { unique: true });

export default mongoose.model('Client', clientSchema);