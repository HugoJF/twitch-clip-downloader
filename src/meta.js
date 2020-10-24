const path = require('path');
const { writeFile } = require('./filesystem');
const { debug } = require('./utils');
const metaPath = (channel) => path.resolve(path.join(__dirname, '..', `${channel}.meta`));

const writeMetaFile = async (channel, clips) => {
    debug('Writing meta data to disk');
    return writeFile(metaPath(channel), JSON.stringify(clips));
};

module.exports = {
    writeMetaFile
};
