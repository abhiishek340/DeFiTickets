const compile = require('./scripts/compile');
const fs = require('fs');

// Write ABI to file
fs.writeFileSync('ABI.txt', compile.interface);

// Write Bytecode to file
fs.writeFileSync('Bytecode.txt', compile.bytecode);

console.log('Files generated successfully!'); 