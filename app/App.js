var React = require('react');
var Router = require('react-router'); // or var Router = ReactRouter; in browsers
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var baobabMixin = require('baobab-react/mixins').root;
var baobabTree = require('./baobabTree');
var RowView = require('./RowView');

var App = React.createClass({

  mixins: [baobabMixin],

  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div overflow='scroll'>
        <RowView/>
        <RouteHandler/>
      </div>
    );
  }
});
            // <li><Link to="about">About</Link></li>
            // <li><Link to="dashboard">Dashboard</Link></li>
            // <li><Link to="sequences">Sequences</Link></li>
            // <li><Link to="SequenceEditor">SequenceEditor5</Link></li>

var routes = (
  <Route handler={App}>
      <Route path="/RowView" name="RowView" handler={RowView}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler tree={baobabTree}/>, document.body);
});
