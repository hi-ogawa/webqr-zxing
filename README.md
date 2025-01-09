# zxing-cpp-app

```sh
$ pnpm build-local
$ ./dist/local/release/hello
Hello World!

$ pnpm build-emscripten
$ node -e 'import("./dist/emscripten/release/hello.js").then(lib => lib.default())'
Hello World!
```
