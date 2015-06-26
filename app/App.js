var React = require('react');
var data = {
  bins:[{
    numberOfRows: 3
  },{
    numberOfRows: 2
  },{
    numberOfRows: 2
  }]
}

// var WellRow = React.createClass {
//   render: function() {
//     var well = this.props.fragments;
//   }
// }


var App = React.createClass({
  render: function () {

    var rowIndexArray = [];
    var binArray = [];
    function makeCombinations (choices, callback, prefix) {
      debugger;
        if(!choices.length) {
            return callback(prefix);
        }
        for(var c = 0; c < choices[0].length; c++) {
            makeCombinations(choices.slice(1), callback, (prefix || []).concat(choices[0][c]));
        }
    }
    function makeRowIndexArray (indices) {
      if(typeof console == "object"){
          rowIndexArray.push(indices);
      }
    }

    var fragments = 0;
    var totalCombinations = 1;
    var combinations = 1;
    this.props.data.bins.forEach(function(bin) {
      fragments = bin.numberOfRows + fragments;
      combinations = combinations * bin.numberOfRows;
      var styleSwitchIndex = totalCombinations/combinations;
      var rowIndex = 0;
      var binRows = []
      for (var col=0; col<bin.numberOfRows; col++) {
        binRows.push(fragments-col);
      }
      binArray.push(binRows);
    });
    makeCombinations(binArray, makeRowIndexArray);
    

    var headers = [];
    var rows = [];
    for (var i = 0; i < fragments; i++) {
      headers.push(i);
    }

    var rowText = 'O';

    return (
      <div className ="wellTable">
        <table style={{width:'100%'}}>
          <thead style={{display:'table-header-group'}}>
            <tr>
              <th>blank </th>
              {headers.map(function(header) {
                return (
                  <th> {"Frag_" + header} </th>
                  );
              })}
            </tr>
          </thead>
          {rowIndexArray.map(function(row, index) {
            return (
              <tr>
                <th colSpan="1"> {"Combo_" + (index + 1)} </th>
                {headers.map(function(header, columnNumber) { //loop through the length of the headers array
                  var cell;
                  console.log('row: ' + row);
                  if (row.indexOf(columnNumber) > -1) {
                    //return a filled in cell
                    debugger
                    cell = (<td> Hit </td>);
                  } else {
                    //return a blank cell
                    cell = (<td>  </td>);
                  }
                  console.log('header: ' + header);
                  return (
                    {cell}
                  );
                })}
              </tr>
              );
          })}
          
        </table>
      </div>
      );
          // {rowIndexArray.map(function(row) {
          //     headers.map(function(header) {
          //     return (
          //     <td dataAlign = "right"> test </td>
          //     )
          //   })
          // })}

                // {headers.map(function (header) {
            //   return (<td> test </td>)
            //   })}
    // return (
    //   <div>
    //       {
    //         var bins = data.bins
    //       }
    //       // {data.bins.map(function (rows) {
    //       //   var binNumber = 5 + 1;  
    //       //   return (<th>
    //       //     <td>{rows}</td>
    //       //   </th>)
    //       // })}
    //   <table style={{width:'100%'}}>
    //       <tr>
    //         <td> hi </td>
    //       </tr>
    //       <tr>
    //         <td>{bins}</td>
    //         <td>Jackson</td> 
    //         <td>94</td>
    //       </tr>
    //     </table>
    //   </div>
    // );
  }
});

React.render(
  <App data={data}/>,
  document.body
);