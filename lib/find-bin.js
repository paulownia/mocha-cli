'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('npm-cli');
const resolve = require("resolve").sync;

function exists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (e) {
        debug(e);
        return false;
    }
}

// for users
function getLocalBin(localPath, binName, basedir) {
    try {
        debug('getLocalBin', 'SEARCH', localPath, 'on', basedir);
        const binPath = resolve(localPath, {basedir});
        debug('getLocalBin', 'FOUND',  binPath)
        return binPath;
    } catch (e) {
        debug(e);
        debug('getLocalBin', binName, 'NOT FOUND');
        return null;
    }
}

// for cli-tool contributors
function findHierarchically(binName, basedir) {
    let dir = basedir
    let prevDir = dir
    do {
        let binPath = path.join(dir, 'bin', binName)
        if (exists(binPath)) {
            debug('findHierarchically', 'FOUND', binPath);
            return binPath;
        }
        debug('findHierarchically', binPath, 'NOT EXIST');

        // Finish if package.json is found.
        if (exists(path.join(dir, "package.json"))) {
            break;
        }

        // Go to next.
        prevDir = dir
        dir = path.resolve(dir, "..")
    } while (dir !== prevDir)

    debug('findHierarchically', binName, 'NOT FOUND');
    return null
}

module.exports = function(localPath, binName, basedir) {
    const path = getLocalBin(localPath, binName, basedir) || findHierarchically(binName, basedir);
    if (path) {
        require(path);
    } else {
        console.error(require("chalk").red.bold(
            `Cannot find local ${binName}.`
        ));
        process.exit(1)
    }
};
