var React = require('react');
require('../style.css');
var data = {
  bins:[{
    array: ['plasmid1','plasmid2','plasmid3']
  },{
    array: ['plasmid4','plasmid5']
  },{
    array: ['plasmid6','plasmid7']
  },{
    array: ['plasmid6','plasmid7']
  }],
  finalVolume: 25,
  bufferMix: 4.75,
  pipetteVolume: 3
 };

var App = React.createClass({
  render: function () {

    var rowIndexArray = [];
    var binArray = [];
    function makeCombinations (choices, callback, prefix) {
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
    var headers = [];
    var finalVolume = data.finalVolume;
    var bufferVolume = data.bufferMix;
    var pipetteVolume = data.pipetteVolume;
    var waterVolume = finalVolume - this.props.data.bins.length*pipetteVolume - bufferVolume;
    var pipetteVolume = data.pipetteVolume;
    this.props.data.bins.forEach(function(bin) {
      fragments = bin.array.length + fragments;
      combinations = combinations * bin.array.length;
      var rowIndex = 0;
      var binRows = [];
      for (var colIndex=0; colIndex<bin.array.length; colIndex++) {
        headers.push(bin.array[colIndex]);

        // //fragments are the total number of frags in the table so far, and is 1 based because it's a length count
        // //to make it zero based we have to delete one
        // var fragIndex = fragments-1;
        var difference = bin.array.length-fragments;
        binRows.push(colIndex-difference);
      }
      binArray.push(binRows);
    });
    makeCombinations(binArray, makeRowIndexArray);
    

    // var headers = [];
    // var rows = [];
    // for (var i = 0; i < fragments; i++) {
    //   headers.push(i);
    // }


    return (
      <div className ="wellTable">
        <table style={{width:'100%'}}>
          <thead style={{display:'table-header-group'}}>
            <tr>
              <th> </th>
              {headers.map(function(header) {
                return (
                  <th> {header} </th>
                  );
              })}
              <th> Buffer and Enzyme Mix (uL) </th>
              <th> dH20 (uL) </th>
              <th> Final Volume (Vf) (uL) </th>
            </tr>
          </thead>
          <tbody style={{border: '1px solid black'}}>
          {rowIndexArray.map(function(row, index) {
            return (
              <tr>
                <th colSpan="1"> {"Output " + (index + 1)} </th>
                {headers.map(function(header, columnNumber) { //loop through the length of the headers array
                  var cell;
                  console.log('row: ' + row);
                  if (row.indexOf(columnNumber) > -1) {
                    //return a filled in cell
                    cell = (<td style={{textAlign: 'center', border: '1px solid black'}}> {pipetteVolume} ml </td>);
                  } else {
                    //return a blank cell
                    cell = (<td>  </td>);
                  }
                  console.log('header: ' + header);
                  return (
                    {cell}
                  );
                })}
                <td style={{textAlign: 'center', border: '1px solid black'}}> {bufferVolume} </td>
                <td style={{textAlign: 'center', border: '1px solid black'}}> {waterVolume} </td>
                <td style={{textAlign: 'center', border: '1px solid black'}}>{finalVolume}</td>
              </tr>
              );
          })}
          </tbody>
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


        // {rows.map(function(row) {
        //   return (
        //     <tr>
        //     <th colSpan="1"> {"Combo_" + row} </th>
        //     </tr>
        //     )
        // })}

React.render(
  <App data={data}/>,
  document.body
);