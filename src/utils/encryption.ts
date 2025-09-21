import crypto from 'crypto';
import { IEncryptionResult, DataProtectionLevel } from '../types';

/**
 * Multi-layer encryption system for PrimeRoseFarms
 * Implements AES-256-GCM encryption with authenticated encryption
 */
export class EncryptionService {
  private readonly algorithm: string;
  private readonly keyLength: number;
  private readonly ivLength: number;
  private readonly tagLength: number;
  private readonly saltLength: number;

  constructor() {
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
    this.tagLength = 16; // 128 bits
    this.saltLength = 32; // 256 bits
  }

  /**
   * Generate a secure random key
   */
  private generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Generate a secure random IV
   */
  private generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Generate a secure random salt
   */
  private generateSalt(): Buffer {
    return crypto.randomBytes(this.saltLength);
  }

  /**
   * Derive key from password using PBKDF2
   */
  private deriveKey(password: string, salt: Buffer): Buffer {
    const iterations = parseInt(process.env.PBKDF2_ITERATIONS || '100000');
    const keylen = parseInt(process.env.PBKDF2_KEYLEN || '32');
    
    return crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha512');
  }

  /**
   * Get encryption key based on protection level
   */
  private getEncryptionKey(protectionLevel: DataProtectionLevel): Buffer {
    const baseKey = process.env.ENCRYPTION_KEY;
    
    if (!baseKey || baseKey.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }

    // Create different keys for different protection levels
    const salt = crypto.createHash('sha256')
      .update(`protection_level_${protectionLevel}`)
      .digest();
    
    return this.deriveKey(baseKey, salt);
  }

  /**
   * Encrypt sensitive data
   */
  public encrypt(data: string, protectionLevel: DataProtectionLevel = DataProtectionLevel.CONFIDENTIAL): IEncryptionResult {
    try {
      const key = this.getEncryptionKey(protectionLevel);
      const iv = this.generateIV();
      const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;
      cipher.setAAD(Buffer.from(`protection_level_${protectionLevel}`));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decrypt(encryptionResult: IEncryptionResult, protectionLevel: DataProtectionLevel = DataProtectionLevel.CONFIDENTIAL): string {
    try {
      const key = this.getEncryptionKey(protectionLevel);
      const iv = Buffer.from(encryptionResult.iv, 'hex');
      const tag = Buffer.from(encryptionResult.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv) as crypto.DecipherGCM;
      decipher.setAAD(Buffer.from(`protection_level_${protectionLevel}`));
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Hash password using bcrypt
   */
  public async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hash(password, rounds);
  }

  /**
   * Verify password against hash
   */
  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  public generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create HMAC signature for data integrity
   */
  public createHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  public verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }
}

// Singleton instance
export const encryptionService = new EncryptionService();
