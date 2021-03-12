const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');

// see below for details on the options
const inputOptions = {
	input: 'src/api/index.js',
	// input: 'src/main.js',
	plugins: [
		resolve(),
		babel({
		  exclude: 'node_modules/**'
		})
	]
};
const outputOptions = {
	file: 'lib/api.js',
    format: 'cjs'
};

async function build() {
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  // console.log(bundle.imports); // an array of external dependencies
  // console.log(bundle.exports); // an array of names exported by the entry point
  // console.log(bundle.modules); // an array of module objects

  // generate code and a sourcemap
  const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);
}

build();
