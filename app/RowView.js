var React = require('react');
var baobabBranch = require('baobab-react/mixins').branch;
var tree = require('./baobabTree');

var RowView = React.createClass({
  mixins: [baobabBranch],
  cursors: {
    visibleRowsData: ['$visibleRowsData'],
    rowLengthCombo: ['$rowLengthCombo'],
  },
  render: function () {
    setTimeout(function function_name(argument) {
      console.log('hey there!!');
      tree.select('rows').push(6);
    },100);
    return (
          <div>
            {this.state.visibleRowsData};
          </div>
    );
  }
});

module.exports = RowView;
