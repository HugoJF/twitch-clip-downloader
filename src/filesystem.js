const { promisify } = require('util');
const fs            = require('fs');

const fsAccess = promisify(fs.access);
const fsWrite  = promisify(fs.writeFile);

const fileExists = async (filePath) => {
    try {
        // throws if it doesn't exist
        await fsAccess(filePath, fs.constants.F_OK);

        return true;
    } catch (error) {
        return false;
    }
};

const writeFile = fsWrite;

module.exports = {
    fileExists,
    writeFile
};
