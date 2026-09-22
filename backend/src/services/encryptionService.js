// backend/src/services/encryptionService.js
const crypto = require('crypto');
const { logger } = require('../config/server');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyDerivationIterations = 100000;
    this.keyLength = 32;
    this.ivLength = 16;
    this.saltLength = 64;
    this.tagLength = 16;
  }

  // Encrypt sensitive data
  encrypt(text, password) {
    try {
      const salt = crypto.randomBytes(this.saltLength);
      const key = crypto.pbkdf2Sync(password, salt, this.keyDerivationIterations, this.keyLength, 'sha256');
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();
      const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
      return result.toString('base64');
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData, password) {
    try {
      const data = Buffer.from(encryptedData, 'base64');
      const salt = data.slice(0, this.saltLength);
      const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
      const tag = data.slice(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
      const encrypted = data.slice(this.saltLength + this.ivLength + this.tagLength);
      const key = crypto.pbkdf2Sync(password, salt, this.keyDerivationIterations, this.keyLength, 'sha256');
      const decipher = crypto.createDecipher(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  async hashPassword(password) {
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password, hash) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
  }
}

module.exports = new EncryptionService();