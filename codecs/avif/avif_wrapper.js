import avifModule from './avif_enc.js';

// Wait for WASM to initialize before calling encode
export async function encode(data, width, height, options) {
  await avifModule.ready;
  return avifModule.encode(data, width, height, options);
}
