function helperGetNum(arr, ptr, byteCount) {
    let result = 0;
    for ( var i = byteCount-1; i >= 0; --i) {
        result = (result * 256) + arr[ptr+i];
    }
    return result;
}

function helperDepositsToString(deposits) {
    let result = "\n";
    for (i = 0; i< deposits.length; ++i){
        result += 
            "{ pubKey:                ["+ deposits[i].pubKey.join(",") +"],\n"+
            "  withdrawalCredentials: ["+deposits[i].withdrawalCredentials.join(",") +"],\n"+
            "  amount: "+deposits[i].amount+" }\n";
    }
    return result;
}

function transition(wasmSource, preState, block) {
    if (preState.length != 32) {
        console.error("preState.length = ", preState.length)
        throw "preState.length != 32"
    }
    // ===========================
    // == PREPARE WASM INSTANCE ==
    // ===========================
    const wasmModule = new WebAssembly.Module(wasmSource);
    const wasmInstance = new WebAssembly.Instance(wasmModule);
    const heap = new Uint8Array(wasmInstance.exports.memory.buffer);
    // ===========================
    // ==== PREPARE WASM HEAP ====
    // ===========================
    // uint8_t preState[32];
    for (let i = 0; i < 32; ++i) {
        heap[i] = preState[i];
    }
    // uint8_t postState[32];
    for (let i = 32; i < 64; ++i) {
        heap[i] = preState[i-32];  // init postState to preState
    }
	// uint32_t   depositCount;
    heap[64] = 0;
    heap[65] = 0;
    heap[66] = 0;
    heap[67] = 0;
    // deposits_t* deposits;
    let depositsPtr = 32+32+4/*depositCount*/+4 /*deposits*/ +4 /*blockSize*/ +block.length;
    heap[68] = (depositsPtr & 0x000000ff);
    heap[69] = (depositsPtr & 0x0000ff00) >> 8;
    heap[70] = (depositsPtr & 0x00ff0000) >> 16;
    heap[71] = (depositsPtr & 0xff000000) >> 24;
	// uint32_t blockSize;
    heap[72] = (block.length & 0x000000ff);
    heap[73] = (block.length & 0x0000ff00) >> 8;
    heap[74] = (block.length & 0x00ff0000) >> 16;
    heap[75] = (block.length & 0xff000000) >> 24;
    // uint8_t block[]
    for (let i = 76; i < 76+block.length; ++i) {
        heap[i] = block[i-76];
    }
    // ===========================
    // ======= RUN WASM ==========
    // ===========================
    const exitCode = wasmInstance.exports.transition(0);
    if (exitCode !== 0) {
        console.error("exit code", exitCode)
        return { exitCode, postState: preState, deposits: [] }
    }
    // ===========================
    // ====== LOAD RESULT ========
    // ===========================
    // read postState
    const postState = heap.slice(32, 64);
    // read deposits
	// uint32_t   depositCount;
    const depositsCount = helperGetNum(heap, 64, 4);
    depositsPtr = helperGetNum(heap, 68, 4);

    const deposits = []
    for (let i = 0; i < depositsCount; ++i) {
        let depositPtr = depositsPtr + i*(48+48+8);
        deposits.push({
            pubKey:                heap.slice(depositPtr, depositPtr+48),
            withdrawalCredentials: heap.slice(depositPtr+48, depositPtr+96),
            amount:                helperGetNum(heap, depositPtr+96, 8),
        });
    }

    return {exitCode, postState, deposits};
}

module.exports = transition;