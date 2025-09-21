import { EncryptionService } from '../src/utils/encryption';
import { DataProtectionLevel } from '../src/types';

describe('Encryption Service', () => {
  let encryptionService: EncryptionService;

  beforeAll(() => {
    encryptionService = new EncryptionService();
  });

  describe('Data Encryption/Decryption', () => {
    test('should encrypt and decrypt data successfully', () => {
      const testData = 'This is sensitive user data';
      const protectionLevel = DataProtectionLevel.CONFIDENTIAL;

      const encrypted = encryptionService.encrypt(testData, protectionLevel);
      
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted.encryptedData).not.toBe(testData);

      const decrypted = encryptionService.decrypt(encrypted, protectionLevel);
      expect(decrypted).toBe(testData);
    });

    test('should handle different protection levels', () => {
      const testData = 'Test data for different levels';
      
      const publicEncrypted = encryptionService.encrypt(testData, DataProtectionLevel.PUBLIC);
      const internalEncrypted = encryptionService.encrypt(testData, DataProtectionLevel.INTERNAL);
      const confidentialEncrypted = encryptionService.encrypt(testData, DataProtectionLevel.CONFIDENTIAL);
      const restrictedEncrypted = encryptionService.encrypt(testData, DataProtectionLevel.RESTRICTED);

      // Each level should produce different encrypted data
      expect(publicEncrypted.encryptedData).not.toBe(internalEncrypted.encryptedData);
      expect(internalEncrypted.encryptedData).not.toBe(confidentialEncrypted.encryptedData);
      expect(confidentialEncrypted.encryptedData).not.toBe(restrictedEncrypted.encryptedData);

      // But all should decrypt to the same original data
      expect(encryptionService.decrypt(publicEncrypted, DataProtectionLevel.PUBLIC)).toBe(testData);
      expect(encryptionService.decrypt(internalEncrypted, DataProtectionLevel.INTERNAL)).toBe(testData);
      expect(encryptionService.decrypt(confidentialEncrypted, DataProtectionLevel.CONFIDENTIAL)).toBe(testData);
      expect(encryptionService.decrypt(restrictedEncrypted, DataProtectionLevel.RESTRICTED)).toBe(testData);
    });

    test('should fail decryption with wrong protection level', () => {
      const testData = 'Test data';
      const encrypted = encryptionService.encrypt(testData, DataProtectionLevel.CONFIDENTIAL);

      expect(() => {
        encryptionService.decrypt(encrypted, DataProtectionLevel.PUBLIC);
      }).toThrow('Decryption failed');
    });

    test('should handle empty and special characters', () => {
      const testCases = [
        '',
        'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        'Unicode: 你好世界 🌍',
        'Numbers: 1234567890',
        'JSON: {"key": "value", "array": [1,2,3]}'
      ];

      testCases.forEach(testData => {
        const encrypted = encryptionService.encrypt(testData, DataProtectionLevel.CONFIDENTIAL);
        const decrypted = encryptionService.decrypt(encrypted, DataProtectionLevel.CONFIDENTIAL);
        expect(decrypted).toBe(testData);
      });
    });
  });

  describe('Password Hashing', () => {
    test('should hash password successfully', async () => {
      const password = 'testPassword123!';
      const hash = await encryptionService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should verify correct password', async () => {
      const password = 'testPassword123!';
      const hash = await encryptionService.hashPassword(password);
      
      const isValid = await encryptionService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'testPassword123!';
      const wrongPassword = 'wrongPassword456!';
      const hash = await encryptionService.hashPassword(password);
      
      const isValid = await encryptionService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    test('should generate secure token', () => {
      const token = encryptionService.generateSecureToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    test('should generate tokens of specified length', () => {
      const lengths = [16, 32, 64];
      
      lengths.forEach(length => {
        const token = encryptionService.generateSecureToken(length);
        expect(token.length).toBe(length * 2); // hex encoding doubles length
      });
    });

    test('should generate unique tokens', () => {
      const token1 = encryptionService.generateSecureToken();
      const token2 = encryptionService.generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('HMAC Signatures', () => {
    test('should create and verify HMAC signature', () => {
      const data = 'Test data for HMAC';
      const secret = 'test-secret-key';
      
      const signature = encryptionService.createHMAC(data, secret);
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA-256 hex length
      
      const isValid = encryptionService.verifyHMAC(data, signature, secret);
      expect(isValid).toBe(true);
    });

    test('should reject invalid HMAC signature', () => {
      const data = 'Test data for HMAC';
      const secret = 'test-secret-key';
      const wrongSecret = 'wrong-secret-key';
      
      const signature = encryptionService.createHMAC(data, secret);
      const isValid = encryptionService.verifyHMAC(data, signature, wrongSecret);
      
      expect(isValid).toBe(false);
    });

    test('should detect data tampering', () => {
      const originalData = 'Original data';
      const tamperedData = 'Tampered data';
      const secret = 'test-secret-key';
      
      const signature = encryptionService.createHMAC(originalData, secret);
      const isValid = encryptionService.verifyHMAC(tamperedData, signature, secret);
      
      expect(isValid).toBe(false);
    });
  });
});
