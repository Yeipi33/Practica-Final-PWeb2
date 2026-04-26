//src/index.js
import { env } from './config/index.js';
import dbConnect from './config/db.js';
import app from './app.js';

const startServer = async () => {
  await dbConnect();

  app.listen(env.PORT, () => {
    console.log(`🚀 BildyApp API en http://localhost:${env.PORT}`);
    console.log(`📍 Entorno: ${env.NODE_ENV}`);
    console.log(`📡 Rutas: /api/user`);
    console.log(`🔌 WebSockets activos`)
  });
};

startServer();