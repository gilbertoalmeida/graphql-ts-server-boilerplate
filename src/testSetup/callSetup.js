/* This file is a workaround, because jest globalSetup of jest (package.jason) cannot call a .ts file. So
We are making a .js file that calls the .ts file */
/* the point of globalSetup is calling something that runs before ALL test files. If you use jest's helper
funtion beforeAll(), it only runs before all tests in that document. And we want to call the start the server only
one time and not at the start of every test document */

require("ts-node/register");

// If you want to reference other typescript modules, do it via require:
const { setup } = require("./setup");

module.exports = async function() {
  // Call your initialization methods here.
  await setup();
  return null;
};
