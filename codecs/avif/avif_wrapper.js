import initWasm from './avif_enc.js';

let modulePromise = null;

function getModule() {
  if (!modulePromise) {
    modulePromise = initWasm();
  }
  return modulePromise;
}

export async function encode(data, width, height, options) {
  const module = await getModule();
  await module.ready;
  return module.encode(data, width, height, options);
}
