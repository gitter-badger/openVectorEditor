var baobab = require('baobab');
var assign = require('lodash/object/assign');
var tree = new baobab({
  staticAttribute: 7,
  rows: [1,2,3,4,5],
  visibleRows: {start: 0, end: 0},
  $rowLength: [
    ['rows'],
    function(rows) {
      return rows.length;
    }
  ],
  $specialRows: [
    ['rows'],
    function(rows) {
      var specialRows = assign([], rows);
      return specialRows.push(9);
    }
  ],
  $visibleRowsData: [
    ['$specialRows'],
    ['visibleRows'],
    function(rows, visibleRows) {
      console.log('rows', rows);
      console.log('visibleRows', visibleRows);
      return rows.slice(visibleRows.start, visibleRows.end);
    }
  ],
  $rowLengthPlus1: [
    ['$rowLength'],
    ['staticAttribute'],
    function(rowLength, staticAttribute) {
      return rowLength + staticAttribute + 1;
    }
  ],
  $rowLengthCombo: [
    ['$rowLength'],
    ['$rowLengthPlus1'],
    function(rowLength, rowLengthPlus1) {
      console.log('rowLength', rowLength);
      console.log('rowLengthPlus1', rowLengthPlus1);
      var combo = rowLength + rowLengthPlus1 + 1;
      console.log('combo', combo);
      return combo
    }
  ],
  
});

module.exports = tree;