package ewasm

import (
	wasm "github.com/wasmerio/go-ext-wasm/wasmer"
)

func initMemory(memory *wasm.Memory, preState [32]byte, block []byte) error {
	heap := memory.Data()
	ptr := 0
	// uint8_t preState[32];
	ptr += copyArray(heap, ptr, preState[:], 0, 32)
	// uint8_t postState[32];
	ptr += copyArray(heap, ptr, preState[:], 0, 32)
	// uint32_t   depositCount;
	ptr += putVarint(heap, 0, ptr, 4)
	// deposit_t* deposits;
	ptr += putVarint(heap, uint64(ptr+4 /*deposits*/ +4 /*blockSize*/ +len(block)), ptr, 4)
	// uint32_t blockSize;
	ptr += putVarint(heap, uint64(len(block)), ptr, 4)
	// uint8_t block[]
	ptr += copyArray(heap, ptr, block, 0, len(block))

	return nil
}

func readMemory(memory *wasm.Memory) ([32]byte, []Deposit, error) {
	heap := memory.Data()
	// read postState
	var postState [32]byte
	copyArray(postState[:], 0, heap, 32, 32)
	// read deposits
	depositsCount := int(getNum(heap, 32+32, 4))
	depositsPtr := int(getNum(heap, 32+32+4, 4))

	deposits := make([]Deposit, depositsCount)
	for i := 0; i < depositsCount; i++ {
		depositPtr := depositsPtr + i*(48+48+8)
		copyArray(deposits[i].PubKey[:], 0, heap, depositPtr, 48)
		copyArray(deposits[i].WithdrawalCredentials[:], 0, heap, depositPtr+48, 48)
		deposits[i].Amount = getNum(heap, depositPtr+96, 8)
	}

	return postState, deposits, nil
}
