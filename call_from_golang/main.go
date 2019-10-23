package ewasm

import (
	"errors"
	"fmt"

	logrus "github.com/sirupsen/logrus"
	wasm "github.com/wasmerio/go-ext-wasm/wasmer"
)

var log = logrus.WithField("prefix", "ewasm")

//ExecuteCode executes wasm code in the ethereum environment
func ExecuteCode(execCode []byte, preState [32]byte, blockData []byte) (postState [32]byte, deposits []Deposit, error error) {
	instance, err := wasm.NewInstance(execCode)
	if err != nil {
		log.WithError(err).Error("error creating instance")
		return preState, nil, err
	}
	defer instance.Close()

	transition := instance.Exports["transition"]
	if transition == nil {
		log.Warnf("transition function not exported. All exports: %v", instance.Exports)
		return preState, nil, errors.New("transition function not exported")
	}
	if err = initMemory(instance.Memory, preState, blockData); err != nil {
		return preState, nil, err
	}

	result, err := transition(0)
	if err != nil {
		log.WithError(err).Error("error executing instance")
		return preState, nil, err
	}
	if result.ToI32() != 0 {
		errStr := fmt.Sprintf("wasm return error code %v", result)
		log.Infof(errStr)
		return preState, nil, errors.New(errStr)
	}

	return readMemory(instance.Memory)
}
