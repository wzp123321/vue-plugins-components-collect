import { AES, enc, mode, pad } from 'crypto-js';

export function FDecrypto(data: string): string {
  return AES.decrypt(data, enc.Utf8.parse('066Q2OmxsfappSoT'), {
    mode: mode.ECB,
    padding: pad.Pkcs7,
  }).toString(enc.Utf8);
}
