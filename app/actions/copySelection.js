var tree = require('../baobabTree');
var assign = require('lodash/object/assign');
var getOverlapsOfPotentiallyCircularRanges = require('../getOverlapsOfPotentiallyCircularRanges');
var collapseOverlapsGeneratedFromRangeComparisonIfPossible = require('../collapseOverlapsGeneratedFromRangeComparisonIfPossible');
var getSubstringByRange = require('get-substring-by-range');
var areRangesValid = require('../areRangesValid');

module.exports = function copySelection() {
    var selectionLayer = tree.select('vectorEditorState', 'selectionLayer').get();
    var sequenceData = tree.select('vectorEditorState', 'sequenceData').get();
    var clipboardDataCursor = tree.select('vectorEditorState', 'clipboardData');
    var allowPartialAnnotationsOnCopy = tree.select('vectorEditorState', 'allowPartialAnnotationsOnCopy').get();
    if (!clipboardDataCursor) {
        throw 'no clipboard cursor..';
    }
    if (sequenceData && selectionLayer.selected) {
        clipboardDataCursor.set(copyRangeOfSequenceData(sequenceData, selectionLayer, allowPartialAnnotationsOnCopy));

        function copyRangeOfSequenceData(sequenceData, rangeToCopy, allowPartialAnnotationsOnCopy) {
            if (sequenceData.sequence !== '' && !sequenceData.sequence) {
                throw 'invalid sequence data';
            }
            var sequenceLength = sequenceData.sequence.length;
            if (!areRangesValid([rangeToCopy], sequenceLength)) {
                throw 'invalid range passed';
            }
            var newSequenceData = {};
            newSequenceData.sequence = getSubstringByRange(sequenceData.sequence, rangeToCopy);
            newSequenceData.features = copyAnnotationsByRange(sequenceData.features, rangeToCopy, sequenceLength);
            newSequenceData.parts = copyAnnotationsByRange(sequenceData.parts, rangeToCopy, sequenceLength);

            function copyAnnotationsByRange(annotations, rangeToCopy, sequenceLength) {
                var copiedAnnotations = [];
                annotations.forEach(function(annotation) {
                    var overlaps = getOverlapsOfPotentiallyCircularRanges(annotation, rangeToCopy, sequenceLength);
                    var collapsedOverlaps = collapseOverlapsGeneratedFromRangeComparisonIfPossible(overlaps, sequenceLength);
                    if (!allowPartialAnnotationsOnCopy) {
                        //filter out any annotations that aren't whole
                        collapsedOverlaps = collapsedOverlaps.filter(function(overlap) {
                            return (overlap.start === annotation.start && overlap.end === annotation.end);
                        });
                    }
                    if (collapsedOverlaps.length > 1) {
                        //tnrtodo: add a new bson id for the 2nd annotation!
                        console.log('splitting annotation on copy!');
                    }
                    collapsedOverlaps.forEach(function(collapsedOverlap) {
                        //shift the collapsedOverlaps by the rangeToCopy start if necessary
                        var collapsedAndShiftedOverlap = shiftCopiedOverlapByRange(collapsedOverlap, rangeToCopy, sequenceLength);
                        copiedAnnotations.push(assign({}, annotation, collapsedAndShiftedOverlap));
                    });
                });
                return copiedAnnotations;
            }
            return assign({}, sequenceData, newSequenceData); //merge any other properties that exist in sequenceData into newSequenceData
        }

        function shiftCopiedOverlapByRange(copiedOverlap, rangeToCopy, sequenceLength) {
            var end = copiedOverlap.end - rangeToCopy.start;
            if (end < 0) {
                end += sequenceLength - 1;
            }
            var start = copiedOverlap.start - rangeToCopy.start;
            if (start < 0) {
                start += sequenceLength - 1;
            }
            return {
                start: start,
                end: end
            };
        }
    }
};