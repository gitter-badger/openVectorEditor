var React = require('react');
var baobabBranch = require('baobab-react/mixins').branch;
var tree = require('./baobabTree');

var RowView = React.createClass({
  mixins: [baobabBranch],
  cursors: {
    visibleRowsData: ['$visibleRowsData'],
  },
  render: function () {
    setTimeout(function function_name(argument) {
      console.log('hey there!!');
      tree.select('vectorEditorState', 'visibleRows').set({start: 0, end: 4});
    },100);
    return (
          <div>
            {this.state.visibleRowsData};
          </div>
    );
  }
});

module.exports = RowView;
