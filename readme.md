# Proposal Wasm Env for ETH 2.0
## Introduction
This project describes a proposal for simpler option than the current [scout](https://github.com/ewasm/scout) to create [the wasm state transition function](https://notes.ethereum.org/@vbuterin/Bkoaj4xpN#Shard-processing)  for phase 2 of ethereum 2.0.
The project implements a compilation of the proposed function from the languages **c** and **rust** and a call to the built wasm from languages **java script** and **golang**.

## Project Content

| Path | Description |
|--|--|
| create_wasm_from_c  | build wasm from **c** source |
| create_wasm_from_rust | build wasm from **rust** source |
| call_from_golang | execution and testing of wasm files from **go** |
| call_from_javascript | execution and testing of wasm files from **java script** |
| test_cases | common set of test cases for all programming languages |
| do_it_all.sh | the script that sequentially builds a program and runs its testing |
| readme.md | proposal text |

## Description

The wasm module will have only two exports:
 - Memory
 ```
    (memory $memory 256)
    (export  "memory" (memory  0))
```
 - Transition function
 ```
    (type  (;0;) (func (param  i32) (result  i32)))
    (export  "transition" (func  0))
```

And will not have imports.

Thus, the wasm code will have a smaller size, their speed will be higher, and the programs calling it will be easier.

All incoming parameters (`pre_stata` and `block_data`) are initiated in the module memory before the transition function is called. The results of the transition function (`post_state` and `deposits`) are also recorded in the module wasm memory, and can be read from it by the calling (host) program.
If the transition function decides to report an error, then it must return a code other than zero.

## How to call

 1. Load wasm module from blockchain (file for test)
 2. Initialize the memory of the module (write `pre_stata` and `block_data` to memory)
 3. Call the wasm function "transition"
 4. Read the memory of the module (read `post_state` and `deposits` from memory)

## Memory structure

| Address (Bytes) | Name | Direction | How the owner initiates before calling the transition function | What are the values after calling the function |
|--|--|--|--|--|
| 0..31 | preState | In | preState | undefined |
| 32..63 | postState | Out | preState | postState |
| 64..67 | depositCount | Out | 0 | deposit count |
| 68..71 | depositsPtr | Out | Indicates position after block data. May be changed in the transition function | deposits pointer |
| 72..75 | blockSize | In | Size of block | undefined |
| 76..76+blockSize | block | In | Size of block | undefined |
| 76+len(block)..76+blockSize+depositCount*104 | deposits | Out | undefined | By default, the transition function writes deposit data here. But the place can be changed through change depositsPtr |

### Deposit structure:
| Address (Bytes) | Name |
|--|--|
| 0..47 | pubKey |
| 47..95 | withdrawalCredentials |
| 96..103 | amount |

## Are we trying?

<pre><font color="#55FF55"><b>alex</b></font>:<font color="#5555FF"><b>~/ewasm</b></font>$ ./do_it_all.sh 

============build from c=============
wasm size: 255

===========build from rust===========
<font color="#55FF55"><b>   Compiling</b></font> transition v0.0.0 (/home/alex/ewasm/build_from_rust)
<font color="#55FF55"><b>    Finished</b></font> release [optimized] target(s) in 0.46s
wasm size: 94959

========test call from golang========
<font color="#00AAAA">INFO</font>[0000] wasm return error code 1                      <font color="#00AAAA">prefix</font>=ewasm
<font color="#00AAAA">INFO</font>[0000] wasm return error code 1                      <font color="#00AAAA">prefix</font>=ewasm
PASS
ok  	_/home/alex/ewasm/call_from_golang	0.026s

======test call from javascript======
&gt; call_ewasm_from_js@1.0.0 test /home/alex/ewasm/call_from_javascript
&gt; mocha

  if the block is not specified, an error is returned
exit code 1
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_c.wasm</font>
exit code 1
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_rust.wasm</font>

  check deposits reading
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_c.wasm</font>
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_rust.wasm</font>

  check postState manipulation
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_c.wasm</font>
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_rust.wasm</font>

  check postState manipulation 2
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_c.wasm</font>
  <font color="#00AA00">  ✓</font><font color="#555555"> transition_rust.wasm</font>


<font color="#55FF55"> </font><font color="#00AA00"> 8 passing</font><font color="#555555"> (44ms)</font>

</pre>

## PS
### Maintainer
Alex Nebotov
### Let me know if something didn't work for you. I am happy to modify the script or instruction.


## What lies ahead:
1) wasm code for ETH transfer
2) define the gas calculation
3) can wasm modules call other modules? How to send and receive parameters?
4) define the WASM validation:
  * wasm version
  * memory requirements
  * remove non-deterministic operations
