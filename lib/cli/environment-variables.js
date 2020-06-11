const dotenv = require('dotenv');

const ensureConfigsAreLoaded = () => {
    const result = dotenv.config();

    if (result.error) {
        console.error(`ERROR!\nPlease create the file ${result.error.path}.`);

        process.exit(0);
    }

    ensureEnvironmentKeyIsLoaded('CLIENT_ID');
    ensureEnvironmentKeyIsLoaded('CLIENT_SECRET');
}

module.exports = {
    ensureConfigsAreLoaded
};

function ensureEnvironmentKeyIsLoaded(key) {
    if (!process.env[key]) {
        console.error(`ERROR!\n${key} not set!`);
        console.error(`\nPlease set ${key} on ${__dirname}/.env`);
        process.exit(0);
    }
}
