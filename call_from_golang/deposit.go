package ewasm

//Deposit define type returned
type Deposit struct {
	PubKey                [48]byte
	WithdrawalCredentials [48]byte
	Amount                uint64
}
