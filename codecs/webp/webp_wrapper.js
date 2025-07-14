import initWasm from './webp_enc.js';

let modulePromise = null;

function getModule() {
  if (!modulePromise) {
    modulePromise = initWasm();
  }
  return modulePromise;
}

/**
 * Encodes raw RGBA data to WebP using Squoosh's WASM module.
 * @param {Uint8ClampedArray} data - RGBA pixel data.
 * @param {number} width
 * @param {number} height
 * @param {object} options - { quality: 0-100 }
 */
export async function encode(data, width, height, options = { quality: 80 }) {
  const module = await getModule();
  await module.ready;
  // Squoosh expects options.quality
  return module.encode(data, width, height, options);
}
