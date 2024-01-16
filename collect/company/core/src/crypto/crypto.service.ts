export class CryptoService {}
const test = 'tiansu-2333';
const iv = new Uint8Array(16);
const key = await crypto.subtle.importKey(
  'jwk',
  { k: 'N_QZ5UdJ2XPyR6x9ZENqCUnQbwaVWG4jpQt6zkDhE84', kty: 'oct' },
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

const en = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, atu(test));
const de = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, htb(bth(en)));
console.log(bth(en));
console.log(bts(new Uint8Array(de)));

function atu(target: string): Uint8Array {
  return new Uint8Array(Array.from({ length: target.length }, (v, i) => target.charCodeAt(i)));
}
function bth(target: ArrayBuffer): string {
  return new Uint8Array(target).reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
}
function htb(target: string): Uint8Array {
  return new Uint8Array(target.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}
function bts(target: Uint8Array): string {
  return String.fromCharCode(...target);
}

const a = await crypto.subtle.exportKey('jwk', key);
console.log(a);
