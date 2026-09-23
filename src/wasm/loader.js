export async function loadHubWasm() {
    return WebAssembly.instantiateStreaming(fetch('/wasm/hub.wasm'));
}
