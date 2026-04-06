//src/models/Usuario.js
//estructura del modelo de usuario

//import { contentSecurityPolicy } from 'helmet';
import mongoose from 'mongoose';
//import { union } from 'zod';

const  addressSchema = new mongoose.Schema({
    street: { type: String, trim: true },
    number: { type: String, trim: true },
    postal: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [8, 'Mínimo 8 caracteres'],
        select: false,          
    },
    name: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    nif: {
        type: String,
        trim: true,
        uppercase: true,
    },
    role: {
        type: String,
        enum: ['admin', 'guest'],
        default: 'admin',
    },
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending',
        index: true,            
        },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationAttempts: {
        type: Number,
        default: 3,
        select: false,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        default: null,
        index: true,     
    },
    address: addressSchema,
    // Refresh token almacenado en el usuario, se invalida en el logout.
    refreshToken: {
        type: String,
        default: null,
        select: false,
    },
    deleted: {
        type: Boolean,
        default: false,
        index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },   
        toObject: { virtuals: true },
});
    
    // Index adicional para role 
userSchema.index({ role: 1 });
    
    // Virtual: fullName = name + ' ' + lastName
    userSchema.virtual('fullName').get(function () {
      if (this.name && this.lastName) {
        return `${this.name} ${this.lastName}`;
      }
      return this.name || '';
    });
    
const User = mongoose.model('User', userSchema);
export default User;