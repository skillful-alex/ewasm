//std::slice::from_raw_parts;

#[repr(packed)]
pub struct Deposit{
    pub_key: [i8;48],
    withdrawal_credentials: [i8;48],
    amount: u64,
}

#[repr(packed)]
#[allow(dead_code)]
pub struct Args {
  pre_state: [i8;32],
  post_state: [i8;32],
  deposit_count: u32,
  deposits: *mut Deposit,
  block_size: u32,
  block_data: [i8;0],
}

#[no_mangle]
pub unsafe extern "C" fn transition(args: *mut Args) -> i32 {
    if (*args).block_size == 0 {
        return 1;
    }
    
    // Put deposits
    if (*args).block_size==1 {
        (*args).deposit_count = 2;

        let d0: *mut Deposit = (*args).deposits.offset(0);
        (*d0).pub_key[1] = 1; 
        (*d0).withdrawal_credentials[2] = 2;
        (*d0).amount = 3;

        let d1: *mut Deposit = (*args).deposits.offset(1);
        (*d1).pub_key[4] = 4;
        (*d1).withdrawal_credentials[5] = 5;
        (*d1).amount = 0xFFFFFFFFFFFFFFFF;
    }

    // Write block[1] to postState byte indicated by block[0]
    if (*args).block_size==2 {
        let block = &(*args).block_data;
        (*args).post_state[ *block.get_unchecked(0) as usize ] = *block.get_unchecked(1);
    }

    return 0;
}