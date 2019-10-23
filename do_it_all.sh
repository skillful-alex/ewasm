echo "====================================="
echo "============build from c============="
echo "====================================="
cd build_from_c
./build.sh
cd ..
stat --printf="wasm size: %s\n" build_from_c/out/transition_erased.wasm
mv build_from_c/out/transition_erased.wasm test_cases/transition_c.wasm

echo "====================================="
echo "===========build from rust==========="
echo "====================================="
cd build_from_rust
./build.sh
cd ..
stat --printf="wasm size: %s\n" build_from_rust/target/wasm32-unknown-unknown/release/transition.wasm
mv build_from_rust/target/wasm32-unknown-unknown/release/transition.wasm test_cases/transition_rust.wasm

echo "====================================="
echo "========test call from golang========"
echo "====================================="
cd call_from_golang
go test -v
cd ..

echo "====================================="
echo "======test call from javascript======"
echo "====================================="
cd call_from_javascript
npm test
cd ..