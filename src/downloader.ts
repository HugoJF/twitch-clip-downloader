import {debug} from "./utils";

const axios = require('axios');
const fs = require('fs');

export function download (url: string, path: string): Promise<string> {
    return new Promise(async (res, rej) => {
        try {
            const { data } = await axios({
                url,
                method:       'GET',
                responseType: 'stream'
            });

            data.on('end', () => {
                debug(`Download ${url} finished on ${path}`);
                fs.renameSync(`${path}.progress`, `${path}`);
                res(path);
            });

            data.pipe(fs.createWriteStream(`${path}.progress`));
        } catch (e) {
            rej(e);
        }
    })
}
