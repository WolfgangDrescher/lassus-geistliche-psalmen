import fs from 'node:fs';
import yaml from 'js-yaml';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getDirname(url) {
    return dirname(fileURLToPath(url));
}

export function getFiles(directory, fileList) {
    fileList = fileList || [];
    let files = fs.readdirSync(directory);
    files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
    for (let i in files) {
        const name = `${directory}/${files[i]}`;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, fileList);
        } else {
            fileList.push(name);
        }
    }
    return fileList;
}

export function splitInChunks(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function getIdFromFilename(path) {
    return path.split(/[\\\/]/).pop().replace(/\..+$/, '');
}

export function getNrFromId(id) {
    return parseInt(id.substring(0, 2), 10);
}

export function readYaml(file) {
    return yaml.load(readFile(file)) || {};
}

export function readFile(file) {
    try {
        return fs.readFileSync(file, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`File ${file} not found`);
            return '';
        }
        throw err;
    }
}

export function writeYaml(file, object, options) {
    const data = yaml.dump(object, Object.assign({
        indent: 4,
        lineWidth: -1,
        sortKeys: true,
    }, options || {}));
    fs.writeFileSync(file, data)
    return yaml.load();
}

export function writeJson(file, value) {
    fs.writeFileSync(file, JSON.stringify(value));
}

export function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export function parseHumdrumReferenceRecords(humdrum) {
    let lines = humdrum.split(/\r?\n/);
    let output = {};
    for (let i = 0; i < lines.length; i++) {
        const matches = lines[i].match(/^!!!\s*([^:]+)\s*:\s*(.*)\s*$/);
        if (matches) {
            const existingValue = output[matches[1]];
            if (Array.isArray(existingValue)) {
                output[matches[1]].push(matches[2])
            } else if (!Array.isArray(existingValue) && typeof existingValue !== 'undefined') {
                output[matches[1]] = [existingValue, matches[2]]
            } else {
                output[matches[1]] = matches[2];
            }
        }
    }
    return output;
}

export function getHumdrumReferenceRecod(humdrum, key) {
    const refs = parseHumdrumReferenceRecords(humdrum);
    if(Array.isArray(key)) {
        for(let value of key) {
            if(refs[value]) {
                return refs[value];
            }
        }
    }
    return refs[key] || null;
}
