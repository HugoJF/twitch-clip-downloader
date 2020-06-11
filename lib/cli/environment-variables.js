const dotenv = require('dotenv');
const path = require('path');

const ensureEnvironmentKeyIsLoaded = (key) => {
    if (!process.env[key]) {
        console.error(`ERROR!\n${key} not set!`);
        console.error(`\nPlease set ${key} on ${__dirname}/.env`);
        process.exit(0);
    }
};

const ensureConfigsAreLoaded = () => {
    const result = dotenv.config();

    if (result.error) {
        const envFileFolder = path.dirname(result.error.path);

        const envExamplePath = path.join(envFileFolder, '.env.example');

        console.error(`ERROR!\nPlease create the file ${result.error.path}`);
        console.error(`See the example file: ${envExamplePath}`);

        process.exit(0);
    }

    ensureEnvironmentKeyIsLoaded('CLIENT_ID');
    ensureEnvironmentKeyIsLoaded('CLIENT_SECRET');
}

module.exports = {
    ensureConfigsAreLoaded
};
