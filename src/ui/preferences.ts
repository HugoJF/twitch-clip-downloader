import fs                 from 'fs';
import {PREFERENCES_PATH} from '../lib/configs';
import {existsSync}       from '../lib/filesystem';

export function writeKey(key: string, value: string): void {
    const preference = loadPreferences();
    preference[key] = value;

    writePreference(preference);
}

export function getKey(key: string, def?: string): string {
    const preferences = loadPreferences();

    return preferences[key] as string ?? def;
}

export function writePreference(preferences: Record<string, unknown>): void {
    fs.writeFileSync(PREFERENCES_PATH, JSON.stringify(preferences));
}

export function loadPreferences(): Record<string, unknown> {
    if (existsSync(PREFERENCES_PATH)) {
        const buffer = fs.readFileSync(PREFERENCES_PATH);

        return JSON.parse(buffer.toString());
    } else {
        return {}; // initial preference value
    }
}
