import { execSync } from 'node:child_process';
import {
    getDirname,
    getFiles,
    readYaml,
    writeYaml,
 } from './utils.js';

const __dirname = getDirname(import.meta.url);

const files = getFiles(`${__dirname}/../kern`);

function parsePrange(output) {
    const prange = {
        noteCount: [],
        tessitura: null,
        mean: null,
        median: null,
    };
    const lines = output.split(/\r?\n|\r|\n/g).filter(l => l);
    lines.forEach(line => {
        if (!(line.startsWith('*') || line.startsWith('!'))) {
            const [keyno, kern, count] = line.split('\t');
            prange.noteCount.push({
                keyno: parseInt(keyno, 10),
                kern,
                count: parseInt(count, 10),
            });
        }
        if (line.startsWith('!!')) {
            const regex = new RegExp(/^!!([a-z]+):\s?([\d.]*)\s?[\w]*(\((.+)\))?$/gm);
            const [full, prop, num, _, note] = regex.exec(line);
            if (prop === 'tessitura') {
                prange[prop] = parseInt(num, 10);
            } else {
                prange[prop] = {
                    keyno: parseFloat(num),
                    kern: note,
                };
            }
        }
    });
    return prange;
}

files.forEach((file) => {
    const yamlFile = file.replace('kern', 'meta').replace('krn', 'yaml');
    const voices = [
        { spine: 1, name: 'bassus' },
        { spine: 3, name: 'tenor' },
        { spine: 5, name: 'cantus' },
    ];
    const yamlConfig = readYaml(yamlFile);
    voices.forEach(voice => {
        const stdout = execSync(`extract -f ${voice.spine} ${file} | prange`);
        console.log(yamlConfig);
        yamlConfig.voices = yamlConfig.voices || {};
        yamlConfig.voices[voice.name] = yamlConfig.voices[voice.name] || {};
        yamlConfig.voices[voice.name].prange = parsePrange(stdout.toString());
    });
    const stdout = execSync(`prange ${file}`);
    yamlConfig.prange = parsePrange(stdout.toString());
    writeYaml(yamlFile, yamlConfig);
});
