if [ -d "target" ]; then rm -Rf target; fi
cargo build --release --target wasm32-unknown-unknown