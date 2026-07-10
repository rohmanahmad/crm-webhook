import { loadEnvFile } from 'node:process';
loadEnvFile('.env');

import { sessionPathFile } from "./config";
import { existsSync, mkdirSync, writeFile } from 'node:fs'

const sessionPathSplitter = sessionPathFile.split('/')
sessionPathSplitter.pop()
const sessionFolderPath = sessionPathSplitter.join('/')

if (!existsSync(sessionFolderPath)) {
    // Create the folder if it doesn't exist
    mkdirSync(sessionFolderPath, { recursive: true });
}
if (!existsSync(sessionPathFile)) {
    writeFile(sessionPathFile, JSON.stringify([]), 'utf-8', (err) => {
        if (err) {
            console.error('Error creating session file:', err);
        } else {
            console.log('Session file created successfully.');
        }
    });
}