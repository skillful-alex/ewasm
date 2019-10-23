package ewasm

import (
	"encoding/binary"
)

func copyArray(dst []byte, dstIndex int, src []byte, srcIndex int, byteCount int) int {
	for i := 0; i < byteCount; i++ {
		dst[dstIndex+i] = src[srcIndex+i]
	}
	return byteCount
}

func putVarint(buf []byte, value uint64, index int, byteCount int) int {
	tmpBuf := make([]byte, 8)
	binary.LittleEndian.PutUint64(tmpBuf, value)
	return copyArray(buf, index, tmpBuf, 0, byteCount)
}

func getNum(arr []byte, ptr int, byteCount int) uint64 {
	result := uint64(0)
	for i := byteCount - 1; i >= 0; i-- {
		result = result*256 + uint64(arr[ptr+i])
	}
	return result
}
