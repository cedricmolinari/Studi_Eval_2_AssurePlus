import SHA256 from 'sha256';
import { Base64 } from '../node_modules/js-base64/base64.js';

export function decryptPassword({ salt, hash, token }, password) {
    const toCompareHash = SHA256(salt + password).toString(Base64);

    if (hash === toCompareHash) {
        return { token };
    }

    return toCompareHash;
}