import uid2 from 'uid2';
import SHA256 from 'sha256';
import { Base64 } from 'js-base64';

export function encryptPassword(password) {

    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(Base64);

    return { salt, hash };
}