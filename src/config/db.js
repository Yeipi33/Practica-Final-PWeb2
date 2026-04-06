//src/config/db.js
//Conexion a MongoDB usando Mongoose

import mongoose from 'mongoose';

import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const dbConnect = async () => {
    const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/PracticaIntermediaPWeb2';

    if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI no definida en .env, usando fallback local:', DB_URI);
    }

    try {
        await mongoose.connect(DB_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        console.error('   URI usada:', DB_URI);
        console.error('   Estado de mongoose:', mongoose.connection.readyState);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  Desconectado de MongoDB');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
});

export default dbConnect;
