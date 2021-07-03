var expect = require('chai').expect;
var should = require('chai').should();
var manifesto = require('../../dist-commonjs/');
var manifests = require('../fixtures/manifests');

var manifest, range, sequence, canvas, content, annotation, body;

describe('presentation 3', function() {

    it('loads successfully', function(done) {
        manifesto.loadManifest(manifests.pres3).then(function(data) {
            manifest = manifesto.parseManifest(data);
            done();
        });
    });

    it('has metadata', function () {
        var metadata = manifest.getMetadata();
        expect(metadata[0].label.getValue()).to.equal('Author');
        expect(metadata[0].label[0].locale).to.equal('en');

        // Legacy API
        expect(metadata[0].label[0].value).to.equal('Author');
    });

    it('has a range', function() {
        range = manifest.getTopRanges()[0].getRanges()[0];
        expect(range).to.exist;
    });

    it('has a sequence', function() {
        sequence = manifest.getSequenceByIndex(0);
        expect(sequence).to.exist;
    });

    it('has a canvas', function() {
        canvas = sequence.getCanvases()[0];
        expect(canvas).to.exist;
        var canvasById = sequence.getCanvasById('http://example.org/iiif/book1/canvas/0');
        expect(canvasById).to.exist;
        var getCanvasByIndex = sequence.getCanvasByIndex(0);
        expect(getCanvasByIndex).to.exist;
    });

    it('range has a canvas', function() {
        canvas = range.getCanvases()[0];
        expect(canvas).to.exist;
/* B */
    });

    it('updates canvas Id if canvas is listed as a fragment in range', function() {
        canvas = range.getCanvases()[1];
        const hasFragment = canvas.id.includes('#xywh=')
        expect(hasFragment).to.exist;
/* B */
    });

    it('has an annotation body', function() {
        content = canvas.getContent();
        annotation = content[0];
        expect(annotation).to.exist;
        body = annotation.getBody()[0];
        expect(body).to.exist;
    });

    it('has a label', function() {
        var label = body.getLabel();
        var labelValue = label.getValue();
        expect(labelValue).to.equal('Page 1');
    });
});