#include <stdint.h>

//deposit_t is struct for save single deposit
typedef struct __attribute__((__packed__)) {
    int8_t pubKey[48];
    int8_t withdrawalCredentials[48];
    uint64_t amount;
} deposit_t;

typedef struct __attribute__((__packed__)) {
  uint8_t preState[32];     // (in) preState
  uint8_t postState[32];    // (out) initialization == preState
  uint32_t   depositCount;  // (out) initialization == 0
  deposit_t* deposits;      // (out) initialization value points to address after block[]
  const uint32_t blockSize; // (in) blockSize
  const uint8_t block[];    // (in) block data
//  deposits_t deposits[];  // (out) transition function can change deposits pointer
} args_t;

// Parameters and results are passed through the heap.
// The heap starts with args_t, followed by deposits_t initiated of zeros.
// The postState and deposits pointer init to preState and  address after block[].
// The result of the transition is passed to *postState and *deposits
// The transition function can change postState and deposits addresses
// On execution error, the transition() should return a number other than 0.

int transition(args_t* args) {
  // Nothing to do
  if (args->blockSize==0) {
    return 1; // error
  }

  deposit_t* deposits = args->deposits;
  // Put deposits
  if (args->blockSize==1) {
    args->depositCount = 2;
    args->deposits[0].pubKey[1] = 1;
    args->deposits[0].withdrawalCredentials[2] = 2;
    args->deposits[0].amount = 3;
    args->deposits[1].pubKey[4] = 4;
    args->deposits[1].withdrawalCredentials[5] = 5;
    args->deposits[1].amount = 0xFFFFFFFFFFFFFFFF;
    return 0;
  }

  // Write block[1] to postState byte indicated by block[0]
  if (args->blockSize==2) {  
    args->postState[ args->block[0] ] = args->block[1];
    return 0;
  }

  // Test change position of deposits result
  if (args->blockSize==3) {
    args->deposits += 777;
    args->depositCount = 1;
    args->deposits[0].pubKey[0] = 7;
    args->deposits[0].withdrawalCredentials[1] = 77;
    args->deposits[0].amount = 777;
    return 0;
  }

  return 0;
}