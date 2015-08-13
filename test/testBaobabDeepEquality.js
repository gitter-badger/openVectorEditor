// var tap = require('tap');
// tap.mochaGlobals();
var expect = require('chai').expect;
var tree = require('../app/baobabTree.js');
// checkIfNonCircularRangesOverlap(frame, sequence, minimumOrfSize, forward, circular)
describe('baobab tree', function() {
	it('to return deep equal true if comparing the same object', function() {
		var state = tree.get('vectorEditorState');
		var state2 = tree.get('vectorEditorState');
		expect(state).to.equal(state2);
	});
	it('to return false if if comparing a different object', function() {
		var state = tree.get('vectorEditorState');
		var state3 = tree.get('vectorEditorState');
		tree.set(['vectorEditorState','showParts'], {newData: 1})
		var state2 = tree.get('vectorEditorState');
		expect(state).to.equal(state3);
		expect(state).to.not.equal(state2);
	});
});