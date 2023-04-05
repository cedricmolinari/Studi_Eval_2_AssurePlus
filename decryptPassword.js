import SHA256 from 'sha256';
import { Base64 } from 'js-base64';

export function decryptPassword({ salt, hash }, password) {
    const toCompareHash = SHA256(salt + password).toString(Base64);

    if (hash === toCompareHash) {
        return true;
    } else {
        return false
    }
}