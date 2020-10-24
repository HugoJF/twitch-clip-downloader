const { promisify } = require('util');
const fs = require('fs');

const access = promisify(fs.access);
const write = promisify(fs.writeFile);

const fileExistsSync = (filePath) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);

        return true;
    } catch (e) {
        return false;
    }
};

const fileExists = async (filePath) => {
    try {
        // throws if it doesn't exist
        await access(filePath, fs.constants.F_OK);

        return true;
    } catch (error) {
        return false;
    }
};

const writeFile = write;

module.exports = {
    fileExistsSync,
    fileExists,
    writeFile
};
