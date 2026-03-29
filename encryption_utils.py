import os
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from dotenv import load_dotenv

load_dotenv()

# Key must be exactly 32 bytes for AES-256
AES_KEY = os.environ.get('AES_SECRET_KEY', 'dermai_default_secret_key_123456').encode('utf-8')
if len(AES_KEY) != 32:
    AES_KEY = AES_KEY.ljust(32, b'\0')[:32]

def encrypt_text(data: str) -> str:
    if not data:
        return data
    cipher = AES.new(AES_KEY, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data.encode('utf-8'))
    # Combine nonce, tag, and ciphertext, then base64 encode
    combined = cipher.nonce + tag + ciphertext
    return base64.b64encode(combined).decode('utf-8')

def decrypt_text(encrypted_data: str) -> str:
    if not encrypted_data:
        return encrypted_data
    try:
        combined = base64.b64decode(encrypted_data)
        nonce = combined[:16]
        tag = combined[16:32]
        ciphertext = combined[32:]
        
        cipher = AES.new(AES_KEY, AES.MODE_GCM, nonce=nonce)
        decrypted = cipher.decrypt_and_verify(ciphertext, tag)
        return decrypted.decode('utf-8')
    except Exception as e:
        print(f"Decryption error: {e}")
        return "[Decryption Failed]"

def encrypt_file(file_bytes: bytes) -> bytes:
    cipher = AES.new(AES_KEY, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(file_bytes)
    return cipher.nonce + tag + ciphertext

def decrypt_file(encrypted_bytes: bytes) -> bytes:
    try:
        nonce = encrypted_bytes[:16]
        tag = encrypted_bytes[16:32]
        ciphertext = encrypted_bytes[32:]
        cipher = AES.new(AES_KEY, AES.MODE_GCM, nonce=nonce)
        decrypted = cipher.decrypt_and_verify(ciphertext, tag)
        return decrypted
    except Exception as e:
        print(f"File decryption error: {e}")
        return b''
