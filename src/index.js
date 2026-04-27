//src/index.js
import { env } from './config/index.js';
import dbConnect from './config/db.js';
import { httpServer } from './app.js';
import app from './app.js';

const startServer = async () => {
  await dbConnect();

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 BildyApp API en http://localhost:${env.PORT}`);
    console.log(`📍 Entorno: ${env.NODE_ENV}`);
    console.log(`📡 Rutas: /api/user`);
    console.log(`🔌 WebSockets activos`)
  });
};

const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} recibido. Cerrando servidor...`)

  httpServer.close(async () => {
    console.log('✅ Servidor HTTP cerrado')
    await mongoose.connection.close()
    console.log('✅ Conexión MongoDB cerrada')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

startServer();