var expect = require('chai').expect;
var should = require('chai').should();
var manifesto = require('../../dist-commonjs/');
var manifests = require('../fixtures/manifests');

var manifest, canvas;

describe('presentation 3 - multiple annotation pages', function() {

    it('loads successfully', function(done) {
        manifesto.loadManifest(manifests.pres3MultiAnnotationPages).then(function(data) {
            manifest = manifesto.parseManifest(data);
            canvas = manifest.getSequenceByIndex(0).getCanvasByIndex(0);
            done();
        });
    });

    it('has correct total for annotation pages', function() {

        expect(canvas.getAnnotationTotalPages()).to.equal(2);
    });

    it('can access first and second pages', () => {
        const firstPage = canvas.getAnnotationPageIndexById('https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/canvas/1/annotation_page/1');
        expect(firstPage).to.equal(0);

        const secondPage = canvas.getAnnotationPageIndexById('https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/canvas/1/annotation_page/2');
        expect(secondPage).to.equal(1);
    })

    it('create annotation pages correctly', () => {
        const firstPage = canvas.getContent('https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/canvas/1/annotation_page/1');
        expect(firstPage).to.have.lengthOf(1);
        expect(firstPage[0].id).to.equal('https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/canvas/1/annotation_page/1/annotation/1');

        const secondPage = canvas.getContent('https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/canvas/1/annotation_page/2');
        expect(secondPage).to.have.lengthOf(1);
        expect(secondPage[0].id).to.equal('https://iiif.io/api/cookbook/recipe/0064-opera-one-canvas/canvas/1/annotation_page/1/annotation/2');
    })

});

