var Baobab = require('baobab');
var deriveData = Baobab.monkey
// var sequenceData = require('./sequenceData');
// var sequenceData = require('./sequenceDataWithOrfsAndTranslations');
var sequenceData = require('./sequenceDataWithOrfsAndTranslations3');
var prepareRowData = require('./prepareRowData');
var findOrfsInPlasmid = require('ve-sequence-utils/findOrfsInPlasmid');
var tidyUpSequenceData = require('ve-sequence-utils/tidyUpSequenceData');
var assign = require('lodash/object/assign');
var getSequenceWithinRange = require('ve-range-utils/getSequenceWithinRange');
var getAminoAcidDataForEachBaseOfDna = require('ve-sequence-utils/getAminoAcidDataForEachBaseOfDna');
var getCutsitesFromSequence = require('ve-sequence-utils/getCutsitesFromSequence');
var enzymeList = require('ve-sequence-utils/enzymeList');

var tree = new Baobab({
    rowToJumpTo: null,
    topSpacerHeight: 0,
    bottomSpacerHeight: 0,
    averageRowHeight: 100,
    charWidth: 15,
    CHAR_HEIGHT: 15,
    ANNOTATION_HEIGHT: 15,
    minimumOrfSize: 200,
    tickSpacing: 21,
    mapViewTickSpacing: 40,
    SPACE_BETWEEN_ANNOTATIONS: 3,
    preloadRowStart: 0,
    showOrfs: true,
    allowPartialAnnotationsOnCopy: false,
    showCutsites: true,
    showParts: true,
    showFeatures: true,
    showTranslations: true,
    showAxis: true,
    showReverseSequence: true,
    rowViewDimensions: {
        height: 500,
        width: 500
    },
    mapViewDimensions: {
        height: 500,
        width: 500
    },
    userEnzymeList: [
        'rsplkii',
        'bme216i',
        'uba1229i',
        'ecl37i'
    ],
    viewportDimensions: {
        height: 500,
        width: 500
    },
    selectionLayer: {
        start: -1,
        end: -1,
        selected: false,
        cursorAtEnd: true
    },
    caretPosition: -1,
    visibleRows: {
        start: 0,
        end: 0
    },
    sequenceData: tidyUpSequenceData(sequenceData),
    clipboardData: null,
    bpsPerRow: deriveData([
        ['rowViewDimensions',
            'width'
        ],
        ['charWidth'],
        function(rowViewDimensionsWidth, charWidth) {
            return Math.floor(rowViewDimensionsWidth / charWidth);
        }
    ]),
    
    userEnzymes: deriveData([
        ['userEnzymeList'],
        function(userEnzymeList) {
            return userEnzymeList.map(function(enzymeName) {
                return enzymeList[enzymeName];
            });
        }
    ]),
    cutsitesByName: deriveData([
        ['sequenceData', 'sequence'],
        ['sequenceData', 'circular'],
        ['userEnzymes'],
        // function (argument) {
        //     return {}
        // }
        getCutsitesFromSequence
    ]),
    cutsites: deriveData([
        ['cutsitesByName'],
        function (cutsitesByName) {
            var cutsitesArray = [];
            Object.keys(cutsitesByName).forEach(function (key) {
                // return cutsitesByName[key]
                cutsitesArray = cutsitesArray.concat(cutsitesByName[key]);
            });
            return cutsitesArray;
        }
    ]),
    translationsWithAminoAcids: deriveData([
        ['sequenceData', 'translations'],
        ['sequenceData', 'sequence'],
        function getTranslationsWithAminoAcids(translations, sequence) {
            return translations.map(function(translation) {
                var translationWithAminoAcids = assign({}, translation);
                var subseq = getSequenceWithinRange(translation, sequence);
                translationWithAminoAcids.aminoAcids = getAminoAcidDataForEachBaseOfDna(subseq, translation.forward);
                return translationWithAminoAcids;
            });
        }
    ]),
    sequenceLength: deriveData([
        ['sequenceData'],
        function(sequenceData) {
            return sequenceData.sequence ? sequenceData.sequence.length : 0;
        }
    ]),
    mapViewCharWidth: deriveData([
        ['mapViewDimensions',
            'width'
        ],
        ['sequenceLength'],
        function(mapViewDimensionsWidth, sequenceLength) {
            return mapViewDimensionsWidth / sequenceLength;
        }
    ]),
    selectedSequenceString: deriveData([
        ['sequenceData', 'sequence'],
        ['selectionLayer'],
        function(sequence, selectionLayer) {
            if (sequence && selectionLayer && selectionLayer.selected) {
                return getSequenceWithinRange(selectionLayer, sequence);
            } else {
                return '';
            }
        }
    ]),
    orfData: deriveData([
        ['sequenceData', 'sequence'],
        ['sequenceData', 'circular'], //decide on what to call this..
        ['minimumOrfSize'],
        findOrfsInPlasmid
    ]),
    combinedSequenceData: deriveData([ //holds usual sequence data, plus orfs, plus parts..
        ['sequenceData'],
        ['orfData'],
        ['translationsWithAminoAcids'],
        ['cutsites'],
        function(sequenceData, orfData, translations, cutsites) {
            return assign({}, sequenceData, {
                orfs: orfData,
                translations: translations,
                cutsites: cutsites
            });
        }
    ]),
    rowData: deriveData([
        ['combinedSequenceData'],
        ['bpsPerRow'],
        function(sequenceData, bpsPerRow) {
            console.log('rowDataUpdated!');
            return prepareRowData(sequenceData, bpsPerRow);
        }
    ]),
    mapViewRowData: deriveData([
        ['combinedSequenceData'],
        ['sequenceLength'],
        function(sequenceData, sequenceLength) {
            console.log('mapDataUpdated!');
            return prepareRowData(sequenceData, sequenceLength);
        }
    ]),
    totalRows: deriveData([
        ['rowData'],
        function(rowData) {
            if (rowData) {
                return rowData.length;
            }
        }
    ]),
    newRandomRowToJumpTo: deriveData([
        ['totalRows'],
        ['rowToJumpTo'],
        function(totalRows) {
            return {
                row: Math.floor(totalRows * Math.random())
            };
        }
    ]),
});

module.exports = tree;