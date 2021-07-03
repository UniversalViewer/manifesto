const finalhandler = require('finalhandler');
const http = require('http');
const serveStatic = require('serve-static');

let server;

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

before(function(done) {

    const serve = serveStatic('test/fixtures', {'index': ['index.html', 'index.htm']});

    server = http.createServer(function(req, res){
        const final = finalhandler(req, res);
        serve(req, res, final)
    });

    server.listen(3001);

    done();
});

after(function() {
    server.close();
});

importTest('aarau', './tests/aarau');
importTest('annotation-dimensions', './tests/annotation-dimensions');
importTest('annotation-list', './tests/annotation-list');
importTest('anzacbulletin', './tests/anzacbulletin');
importTest('audio', './tests/audio');
importTest('bad-manifest-url', './tests/bad-manifest-url');
importTest('biocrats', './tests/biocrats');
importTest('book-of-remembrance', './tests/book-of-remembrance');
importTest('canvas-metadata', './tests/canvas-metadata');
importTest('cardiganshire', './tests/cardiganshire');
importTest('collection-with-thumbnail', './tests/collection-with-thumbnail');
importTest('correspondance', './tests/correspondance');
importTest('deep-hierarchy', './tests/deep-hierarchy');
importTest('default-label', './tests/default-label');
importTest('get-manifest-behavior', './tests/get-manifest-behavior');
importTest('get-range-by-path', './tests/get-range-by-path');
importTest('get-range-by-id', './tests/get-range-by-id');
importTest('get-resource', './tests/get-resource');
importTest('herbal', './tests/herbal');
importTest('horriblemurders', './tests/horriblemurders');
importTest('https', './tests/https');
importTest('illustrationsofchina', './tests/illustrationsofchina');
importTest('items-not-sequence', './tests/items-not-sequence');
importTest('LabelValuePair', './tests/LabelValuePair.test');
importTest('LanguageMap', './tests/LanguageMap.test');
importTest('logo', './tests/logo');
importTest('lunchroommanners', './tests/lunchroommanners');
importTest('manifest-with-thumbnail', './tests/manifest-with-thumbnail');
importTest('members-collection', './tests/members-collection');
importTest('members-ranges', './tests/members-ranges');
importTest('members', './tests/members');
importTest('multi-value-range-metadata', './tests/multi-value-range-metadata');
importTest('nested', './tests/nested');
importTest('nga-highlights', './tests/nga-highlights');
importTest('no-nav-ranges', './tests/no-nav-ranges');
importTest('plato', './tests/plato');
importTest('poster-canvas', './tests/poster-canvas');
importTest('potterselectric', './tests/potterselectric');
importTest('pres3-3d', './tests/pres3-3d');
importTest('pres3-av-basic', './tests/pres3-av-basic');
importTest('pres3-collection', './tests/pres3-collection');
importTest('pres3-collection2', './tests/pres3-collection2');
importTest('pres3-collection3', './tests/pres3-collection3');
importTest('pres3-collection4', './tests/pres3-collection4');
importTest('pres3-multiple-annotation-pages', './tests/pres3-multiple-annotation-pages');
importTest('pres3-pdf', './tests/pres3-pdf');
importTest('pres3', './tests/pres3');
importTest('presentation2-paging', './tests/presentation2-paging');
importTest('presentation3-paging', './tests/presentation3-paging');
importTest('PropertyValue', './tests/PropertyValue.test')
importTest('pseudoalbert', './tests/pseudoalbert');
importTest('qatarrighttoleft', './tests/qatarrighttoleft');
importTest('querystring', './tests/querystring');
importTest('required-statement', './tests/required-statement');
importTest('riksarkivetlarge', './tests/riksarkivetlarge');
importTest('scroll', './tests/scroll');
importTest('static-thumbs', './tests/static-thumbs');
importTest('storyofwellcome', './tests/storyofwellcome');
importTest('string', './tests/string');
importTest('tankeryshouse', './tests/tankeryshouse');
importTest('translations', './tests/translations');
importTest('witnesstopeter', './tests/witnesstopeter');
importTest('Utils', './tests/Utils.test');
