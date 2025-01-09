project('zxing-cpp-app', 'cpp')

compiler = meson.get_compiler('cpp')
is_emscripten = compiler.get_id() == 'emscripten'

if is_emscripten
  executable(
    'hello',
    'src/hello.cpp',
    dependencies: [],
    name_suffix: 'js',
    link_args: ['-sALLOW_MEMORY_GROWTH=1', '-sEXPORT_ES6', '--minify', '0']
  )
else
  executable(
    'hello',
    'src/hello.cpp',
    dependencies: []
  )
endif
