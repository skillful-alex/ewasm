## Research of the transition function signature

Folder contains:

|  File name                 | Description  |
| -------------------------- | ------------ |
| transition.c               | defines the transition function to compile in wasm |
| out/transition.wasm        | emcc compilation result                 |
| out/transition_erased.wasm | target result, after a little cleaning  |

### Compilation wasm:
#### Use emcc
```bash
docker run --rm -v $(pwd):/src trzeci/emscripten  \
  emcc -O3                                        \
    -s EXPORTED_FUNCTIONS='["_transition"]'       \
    -s MALLOC="emmalloc"                          \
    /src/transition.c                             \
    -o /src/out/transition.wasm
```
wasm size: 264 bytes
The only import is memory. ```(import "env" "memory" (memory $env.memory 256 256))```
The only export is "_transition" function. ```(export "_transition" (func $_transition)))```

#### Modify wasm (cleanup)
:question: Is it possible to configure the compilation so that later there is no need to clean up the code?

About wasm memory:
> "In the current version of WebAssembly, **at most one memory** may be defined or imported in a single module, and all constructs implicitly reference this memory 0. This restriction may be lifted in future versions.", [Link](https://webassembly.github.io/spec/core/syntax/modules.html#memories).

* Replace memory declortion
```
(import "env" "memory" (memory (;0;) 256 256))
```
to 
```
(memory $memory 256)
(export "memory" (memory 0))
```
* Replace exported function name
```
(export "_transition" (func 0)))
```
to 
```
(export "transition" (func 0)))
```

Cleaning Code:

```bash
wasm2wat out/transition.wasm -o out/transition.wat &&                         \
                                                                              \
sed                                                                           \
-e 's/(import "env" "memory" (memory (;0;) 256 256))/(memory $memory 256)(export "memory" (memory 0))/g' \
-e 's/(export "_transition" (func 0)))/(export "transition" (func 0)))/g'          \
out/transition.wat > out/transition_erased.wat                                     \
                                                                                   \
&& wat2wasm out/transition_erased.wat  -o out/transition_erased.wasm
```

Result, wasm doesn't import anything. Export:
* memory 
* function int transition()
