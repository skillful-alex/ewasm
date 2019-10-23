if [ -d "out" ]; then rm -Rf out; fi
mkdir -p out

docker run --rm -v $(pwd):/src trzeci/emscripten  \
  emcc -O3                                        \
    -s EXPORTED_FUNCTIONS='["_transition"]'       \
    -s MALLOC="emmalloc"                          \
    /src/transition.c                             \
    -o /src/out/transition.wasm

#https://github.com/WebAssembly/wabt
export PATH=$PATH:$HOME/wabt/out/
wasm2wat out/transition.wasm -o out/transition.wat

sed                                                                           \
-e 's/(import "env" "memory" (memory (;0;) 256 256))/(memory $memory 256)(export "memory" (memory 0))/g' \
-e 's/(export "_transition" (func 0)))/(export "transition" (func 0)))/g'          \
out/transition.wat > out/transition_erased.wat

wat2wasm out/transition_erased.wat  -o out/transition_erased.wasm
