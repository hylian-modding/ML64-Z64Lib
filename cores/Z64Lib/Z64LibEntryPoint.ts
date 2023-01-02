import { ExternalAPIProvider } from "modloader64_api/ExternalAPIProvider";
import path from 'path';

@ExternalAPIProvider("Z64Lib", require(path.resolve(__dirname, "package.json")).version, path.resolve(__dirname))
class Z64LibAPI {
}

module.exports = require("./src/Z64Lib.js");