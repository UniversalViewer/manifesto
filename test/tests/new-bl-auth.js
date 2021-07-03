var expect = require('chai').expect;
var should = require('chai').should();
var manifesto = require('../../dist-commonjs/');
var manifests = require('../fixtures/manifests');

var manifest;

describe('#newblauth', function() {

    it('loads successfully', function (done) {
        manifesto.loadManifest(manifests['bl-new-auth']).then(function(data) {
            manifest = manifesto.parseManifest(data);
            done();
        });
    });

    it('has joined range value', function () {
        var canvas = manifest.getCanvasByIndex(0);

        expect(canvas.getServices()).to.have.lengthOf(2);
    });

});
