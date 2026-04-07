import app from './src/app.js';
import http from 'http';

const server = http.createServer(app);
server.listen(3002, async () => {
  console.log('listening');
  try {
    const res = await fetch('http://localhost:3002/health');
    console.log('STATUS', res.status);
    console.log('BODY', await res.text());
  } catch (error) {
    console.error('ERR', error);
  } finally {
    server.close();
  }
});
