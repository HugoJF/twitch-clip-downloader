const fs   = require('fs');
const path = require('path');

const allPrompts = {};

fs.readdirSync(__dirname)
    .filter(ignoreFolders)
    .filter(ignoreUnwantedFiles)
    .forEach(file => {
        const rawPromptName = file.split('.')[0];

        const promptName = normalizeName(rawPromptName);

        allPrompts[promptName] = require(path.join(__dirname, file));
    });

module.exports = allPrompts;

function ignoreFolders (file) {
    return fs.lstatSync(path.join(__dirname, file)).isFile();
}

function ignoreUnwantedFiles (file) {
    return (file !== 'index.js');
}

function normalizeName (rawName) {
    const name = rawName.split('-');

    return `${name[0]}${capitalizeFirstLetter(name[1])}`;
}

function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
