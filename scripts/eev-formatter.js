import { exec } from 'node:child_process';
import fs from 'node:fs';

import {
    getDirname,
    getFiles,
    readFile,
    getHumdrumReferenceRecod,
    parseHumdrumReferenceRecords,
} from './utils.js';

const __dirname = getDirname(import.meta.url);

const files = getFiles(`${__dirname}/../kern`);

files.forEach((file) => {
    exec(`echo $(git log -1 --format=%cd --date=short ${file}) | sed 's/-/\\//g'`, (err, stdout, stderr) => {
        if (err) {
            return;
        }
        const humdrum = readFile(file);
        const lastGitCommitOfFile = stdout.trim();
        const eevDate = getHumdrumReferenceRecod(humdrum, 'EEV');
        if (eevDate) {
            fs.writeFileSync(file, humdrum.replace(/!!!EEV:\s?([^\s]*)/, `!!!EEV: ${lastGitCommitOfFile}`));
        } else {
            if (typeof parseHumdrumReferenceRecords(humdrum).EEV === 'undefined') {
                fs.writeFileSync(file, `${humdrum}\n!!!EEV: ${lastGitCommitOfFile}`);
            }
        }
    });
});
