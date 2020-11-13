import {promisify} from "util";
import fs from "fs";

export const access = promisify(fs.access);
export const write = promisify(fs.writeFile);

export const existsSync = (filePath: string) => {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);

        return true;
    } catch (e) {
        return false;
    }
};

export const exists = async (filePath: string) => {
    try {
        // throws if it doesn't exist
        await access(filePath, fs.constants.F_OK);

        return true;
    } catch (error) {
        return false;
    }
};
