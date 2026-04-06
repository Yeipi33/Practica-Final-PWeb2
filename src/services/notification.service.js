// src/services/notification.service.js
import { EventEmitter } from 'node:events';

class NotificationService extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this._registerListeners();
  }
    //listeners para eventos de usuario
  _registerListeners() {
    this.on('user:registered', (user) => {
      console.log(`[EVENT] user:registered → ${user.email} (código: ${user.verificationCode})`);
    });

    this.on('user:verified', (user) => {
      console.log(`[EVENT] user:verified → ${user.email}`);
    });

    this.on('user:invited', (user) => {
      console.log(`[EVENT] user:invited → ${user.email}`);
    });

    this.on('user:deleted', (user) => {
      console.log(`[EVENT] user:deleted → ${user.email}`);
    });

    this.on('error', (err) => {
      console.error('[EVENT] Error:', err.message);
    });
  }
}

export const notificationService = new NotificationService();