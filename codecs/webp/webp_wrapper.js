import webpModule from './webp_enc.js';

export async function encode(data, width, height, options) {
  await webpModule.ready;
  return webpModule.encode(data, width, height, options);
}
