var $ = require('cheerio');
var Request = require('superagent');
var Q = require('q');
var _ = require('underscore');
var fs = require('fs');
var crypto = require('crypto');
var Path = require('path');
var Url = require('url');

/* -------------------------------- */
module.exports = {
    // Text utils
    normalize : normalize,
    trim : trim,
    isEmpty : isEmpty,

    // SHA1
    hash : hash,

    getFileNameFromUrl : getFileNameFromUrl,

    // HTTP loading
    loadPage : loadPage,
    load : load,

    // FS IO
    checkDir : checkDir,
    writeText : writeText,
    readText : readText,
    writeJson : writeJson,
    readJson : readJson,

    // HTML utils
    resolve : resolve,
    resolveRefs : resolveRefs,
    toHtml : toHtml,
    toText : toText
}

/* -------------------------------- */
function resolve(url, e, tag, attr) {
    e.find(tag).each(function() {
        var href = $(this).attr(attr);
        href = Url.resolve(url, href);
        $(this).attr(attr, href);
    })
}
function resolveRefs(url, e) {
    resolve(url, e, 'a', 'href');
    resolve(url, e, 'img', 'src');
}

function toHtml(url, str) {
    str = normalize(str);
    str = '<div>' + str + '</div>';
    var e = $(str);
    resolve(url, e, 'a', 'href');
    resolve(url, e, 'img', 'src')
    return e;
}
function toText(url, str) {
    return normalize(toHtml(url, str).text());
}

function normalize(str) {
    return trim(str).replace(/\s+/gim, ' ');
}

function isEmpty(str) {
    if (!str)
        return true;
    return str == '';
}
function trim(str) {
    if (!str)
        return '';
    return str.replace(/^\s+|\s+$/gim, '');
}

function hash(str) {
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

function getFileNameFromUrl(url, ext) {
    var o = Url.parse(url);
    // var fileName = hash(url) + '.html';
    ext = ext || '';
    var fileName = o.host + '-' + Path.basename(o.pathname) + ext;
    return fileName;
}

function checkDir(dir) {
    function f() {
    }
    return Q.nfcall(fs.mkdir, dir).then(f, f);
}

function loadPage(options) {
    var dir = options.dir;
    var url = options.url;
    var reload = options.reload;
    return checkDir(dir).then(function() {
        var fileName = dir + getFileNameFromUrl(url, '.html');
        if (!reload && fs.existsSync(fileName)) {
            return readText(fileName).then(function(str) {
                return $(str);
            });
        } else {
            return load(url).then(function(doc) {
                return writeText(fileName, doc).then(function() {
                    return $(doc);
                })
            })
        }
    });
}

function load(url) {
    var deferred = Q.defer();
    try {
        Request.get(url, deferred.makeNodeResolver());
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise.then(function(res) {
        return res.text;
    });
}

function writeText(file, str) {
    return Q.nfcall(fs.writeFile, file, str);
}
function readText(file) {
    return Q.nfcall(fs.readFile, file, 'utf8');
}

function writeJson(file, obj) {
    var str = JSON.stringify(obj, null, 2);
    return writeText(file, str);
}

function readJson(file) {
    return readText(file).then(function(str) {
        return JSON.parse(str);
    });
}
