// login

var expect = require('chai').expect;
var should = require('chai').should();
var manifesto = require('../../dist-commonjs/');
var manifests = require('../fixtures/manifests');
var ServiceProfile = require('@iiif/vocabulary/dist-commonjs/').ServiceProfile;

var manifest, sequence, canvas, imageService;

describe('#loadsCorrespondance', function() {
    it('loads successfully', function (done) {
        manifesto.loadManifest(manifests.correspondance).then(function(data) {
            manifest = manifesto.parseManifest(data);
            sequence = manifest.getSequenceByIndex(0);
            canvas = sequence.getCanvasByIndex(0);
            done();
        });
    });

    it('canvas has images', function () {
        var images = canvas.getImages();
        var annotation = images[0];
        expect(annotation).to.exist;
        var resource = annotation.getResource();
        expect(resource).to.exist;
        var profile = ServiceProfile.IMAGE_2_LEVEL_0; // Was previously LEVEL_1 but this does not exist.
        imageService = resource.getService(profile);
        expect(imageService).to.exist;
    });

    it('imageService has login service', function () {
        var profile = ServiceProfile.AUTH_0_LOGIN;
        var loginService = imageService.getService(profile);
        expect(loginService).to.exist;
    });
});
