const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, '../artifacts/contracts');
const contractPath = path.resolve(__dirname, '../contracts/TicketSale.sol');
const sourceCode = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'TicketSale.sol': {
      content: sourceCode,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Ensure the build directory exists
fs.ensureDirSync(buildPath);

// Extract and save the contract artifacts
for (const contractName in output.contracts['TicketSale.sol']) {
  const contract = output.contracts['TicketSale.sol'][contractName];
  
  fs.outputJsonSync(
    path.resolve(buildPath, `${contractName}.sol/${contractName}.json`),
    {
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object
    }
  );
}

console.log('Contract compiled successfully!');