
var React = require('react');
var _ = require('lodash');
var classnames = require('classnames');
var getOverlapsOfPotentiallyCircularRanges = require('./getOverlapsOfPotentiallyCircularRanges');
var baobabBranch = require('baobab-react/mixins').branch;
var setSelectionLayer = require('./actions/setSelectionLayer');
var getXStartAndWidthOfRowAnnotation = require('./getXStartAndWidthOfRowAnnotation');
var getXCenterOfRowAnnotation = require('./getXCenterOfRowAnnotation');


var AnnotationContainer = React.createClass({
  render: function () {
    var {annotationRanges, bpsPerRow, charWidth, annotationHeight, spaceBetweenAnnotations} = this.props;
    if (annotationRanges.length === 0) {
      return null;
    }
    var maxAnnotationYOffset = 0;
    var annotationsSVG = [];
    annotationRanges.forEach(function(annotationRange) {
      if (annotationRange.yOffset > maxAnnotationYOffset) {
        maxAnnotationYOffset = annotationRange.yOffset;
      }
      var annotation = annotationRange.annotation;

      annotationsSVG.push(<path
        onClick={function (event) {
          // appActions.setCaretPosition(-1);
          setSelectionLayer(this);
          event.stopPropagation();
        }.bind(annotation)}
        key={annotation.id + 'start:' + annotationRange.start}
        className={classnames(annotation.id, annotation.type)}
        d={createAnnotationRawPath(annotationRange, bpsPerRow, charWidth, annotationHeight)}
        stroke={annotation.color}
        fillOpacity={0.4}
        fill={annotation.color}/>); //tnrtodo: change fill opacity to a passed variable

      annotationsSVG.push(<path
        key={'directionArrow' + annotation.id + 'start:' + annotationRange.start}
        d={createAnnotationArrowRawPath(annotationRange, bpsPerRow, charWidth, annotationHeight)}
        stroke={'black'} />);
    });
    var height = (maxAnnotationYOffset + 1) * (annotationHeight + spaceBetweenAnnotations);
    return (
      <svg className="annotationContainer" width="100%" height={height} >
        {annotationsSVG}
      </svg>
    );
    function createAnnotationArrowRawPath(annotationRange, bpsPerRow, charWidth, annotationHeight) {
      var annotation = annotationRange.annotation;
      var xCenter = getXCenterOfRowAnnotation(annotationRange, bpsPerRow, charWidth);
      var yStart = annotationRange.yOffset * (annotationHeight + spaceBetweenAnnotations);
      var rangeType = annotationRange.rangeType;
      var forward = annotation.forward;
      var xStart = xCenter - charWidth/2;
      var xEnd = xCenter + charWidth/2;
      var yEnd = yStart + annotationHeight;
      var yMiddle = yStart + annotationHeight/2;
      var path;
      if (forward) {
        path = "M" + xStart + "," + yStart + " L" + xEnd + "," + yMiddle + " L" + xStart + "," + yEnd;
      } else {

      }
      //either "beginning", "end" or "beginningAndEnd"
      if (rangeType === 'beginningAndEnd') {

      } else {

      }
      return path;
    }

    function createAnnotationRawPath(annotationRange, bpsPerRow, charWidth, annotationHeight) {
      var annotation = annotationRange.annotation;
      var {xStart, width} = getXStartAndWidthOfRowAnnotation(annotationRange, bpsPerRow, charWidth);
      var yStart = annotationRange.yOffset * (annotationHeight + spaceBetweenAnnotations);
      var height = annotationHeight;
      var rangeType = annotationRange.rangeType;
      var forward = annotation.forward;
      var xEnd = xStart + width;
      var yEnd = yStart + height;

      if (forward) {

      } else {

      }
      //either "beginning", "end" or "beginningAndEnd"
      if (rangeType === 'beginningAndEnd') {

      } else {

      }
      var path = "M" + xStart + "," + yStart + " L" + xEnd + "," + yStart + " L" + xEnd + "," + yEnd + " L" + xStart + "," + yEnd + " Z";
      return path;
    }

  }
});
module.exports = AnnotationContainer;