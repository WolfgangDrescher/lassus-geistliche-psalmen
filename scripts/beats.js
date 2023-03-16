import { execSync } from 'node:child_process';
import {
    getDirname,
    getFiles,
    readYaml,
    writeYaml,
 } from './utils.js';

const __dirname = getDirname(import.meta.url);

const files = getFiles(`${__dirname}/../kern`);

files.forEach((file) => {
    const yamlFile = file.replace('kern', 'meta').replace('krn', 'yaml');

    const kernBeats = execSync(`cat ${file} | beat -c`).toString().trim();
    const kernBeatsLines = kernBeats.split('\n');

    let beats = null;
    for (let i = kernBeatsLines.length - 1; i >= 0; i--) {
        if (kernBeatsLines[i].match(/^\d+$/)) {
            beats = parseInt(kernBeatsLines[i], 10);
            break;
        }
    }

    const yamlConfig = readYaml(yamlFile);
    yamlConfig.beats = beats;
    writeYaml(yamlFile, yamlConfig);
});
