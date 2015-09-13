import React, { PropTypes } from 'react';
import areNonNegativeIntegers from 'validate.io-nonnegative-integer-array';

function noop() {}

const InfiniteScoller = React.createClass({
  propTypes: {
    averageElementHeight: PropTypes.number.isRequired,
    containerHeight: PropTypes.number.isRequired,
    preloadRowStart: PropTypes.number.isRequired,
    totalNumberOfRows: PropTypes.number.isRequired,
    renderRow: PropTypes.func.isRequired,
    rowToJumpTo: PropTypes.shape({
      row: PropTypes.number,
    }),
    containerClassName: PropTypes.string,
    onScroll: PropTypes.func,
  },

  getDefaultProps() {
    return {
      onScroll: noop,
      containerClassName: 'infiniteContainer',
    };
  },

  onEditorScroll(event) {
    // tnr: we should maybe keep this implemented..
    // if (this.adjustmentScroll) {
    //   // adjustment scrolls are called in componentDidUpdate where we manually set the scrollTop (which inadvertantly triggers a scroll)
    //   this.adjustmentScroll = false;
    //   return;
    // }

    let infiniteContainer = event.currentTarget;
    const visibleRowsContainer = React.findDOMNode(this.refs.visibleRowsContainer);
    // const currentAverageElementHeight = (visibleRowsContainer.getBoundingClientRect().height / this.state.visibleRows.length);
    this.oldRowStart = this.rowStart;
    const distanceFromTopOfVisibleRows = infiniteContainer.getBoundingClientRect().top - visibleRowsContainer.getBoundingClientRect().top;
    const distanceFromBottomOfVisibleRows = visibleRowsContainer.getBoundingClientRect().bottom - infiniteContainer.getBoundingClientRect().bottom;
    let newRowStart;
    let rowsToAdd;
    if (distanceFromTopOfVisibleRows < 0) {
      if (this.rowStart > 0) {
        rowsToAdd = Math.ceil(-1 * distanceFromTopOfVisibleRows / this.props.averageElementHeight);
        newRowStart = this.rowStart - rowsToAdd;

        if (newRowStart < 0) {
          newRowStart = 0;
        }

        this.prepareVisibleRows(newRowStart, this.state.visibleRows.length);
      }
    } else if (distanceFromBottomOfVisibleRows < 0) {
      // scrolling down, so add a row below
      const rowsToGiveOnBottom = this.props.totalNumberOfRows - 1 - this.rowEnd;
      if (rowsToGiveOnBottom > 0) {
        rowsToAdd = Math.ceil(-1 * distanceFromBottomOfVisibleRows / this.props.averageElementHeight);
        newRowStart = this.rowStart + rowsToAdd;

        if (newRowStart + this.state.visibleRows.length >= this.props.totalNumberOfRows) {
          // the new row start is too high, so we instead just append the max rowsToGiveOnBottom to our current preloadRowStart
          newRowStart = this.rowStart + rowsToGiveOnBottom;
        }
        if (newRowStart < 0) {
          newRowStart = 0;
        }
        this.prepareVisibleRows(newRowStart, this.state.visibleRows.length);
      }
    } else { // eslint-disable-line no-empty
      // we haven't scrolled enough, so do nothing
    }
    this.updateTriggeredByScroll = true;
    this.props.onScroll(event);
    // set the averageElementHeight to the currentAverageElementHeight
    // setAverageRowHeight(currentAverageElementHeight);
  },

  componentWillReceiveProps(nextProps) {
    // if (this.props.rowJumpTrigger !== nextProps.rowJumpTrigger) {
    //   this.prepareVisibleRows(nextProps.rowToJumpTo, newNumberOfRowsToDisplay);
    //   this.rowJumpTriggered = true;
    //   this.rowJumpedTo = nextProps.rowToJumpTo;
    // }
    const newNumberOfRowsToDisplay = this.state.visibleRows.length;
    if (this.props.rowToJumpTo && this.props.rowToJumpTo !== nextProps.rowToJumpTo) {
      this.prepareVisibleRows(nextProps.rowToJumpTo.row, newNumberOfRowsToDisplay);
      this.rowJumpTriggered = true;
      this.rowJumpedTo = nextProps.rowToJumpTo.row;
    } else {
      const rowStart = this.rowStart;
      // we need to set the new totalNumber of rows prop here before calling prepare visible rows
      // so that prepare visible rows knows how many rows it has to work with
      this.props.totalNumberOfRows = nextProps.totalNisiblenumberOfRows;
      this.prepareVisibleRows(rowStart, newNumberOfRowsToDisplay);
    }
  },

  componentWillUpdate() {
    let visibleRowsContainer = React.findDOMNode(this.refs.visibleRowsContainer);
    this.soonToBeRemovedRowElementHeightDifferences = 0;
    this.numberOfRowsAddedToTop = 0;
    if (this.updateTriggeredByScroll === true) {
      this.updateTriggeredByScroll = false;
      const rowStartDifference = this.oldRowStart - this.rowStart;
      if (rowStartDifference < 0) {
        // scrolling down
        for (let i = 0; i < -rowStartDifference; i++) {
          const soonToBeRemovedRowElement = visibleRowsContainer.children[i];
          if (soonToBeRemovedRowElement) {
            const height = soonToBeRemovedRowElement.getBoundingClientRect().height;
            this.soonToBeRemovedRowElementHeightDifferences += this.getSizeOf(this.oldRowStart + i) - height;
            // this.soonToBeRemovedRowElementHeightDifferences.push(soonToBeRemovedRowElement.getBoundingClientRect().height);
          }
        }
      } else if (rowStartDifference > 0) {
        this.numberOfRowsAddedToTop = rowStartDifference;
      }
    }
  },

  cacheSizes() {
    const {cache, rowStart} = this;
    const itemEls = React.findDOMNode(this.refs.visibleRowsContainer).children;
    for (let i = 0, l = itemEls.length; i < l; ++i) {
      cache[rowStart + i] = itemEls[i].getBoundingClientRect().height;
    }
    this.averageComputedElHeight = Object.keys(cache).reduce(function (previousVal, key) {
      return previousVal + cache[key];
    }, 0);
  },

  componentDidUpdate() {
    // strategy: as we scroll, we're losing or gaining rows from the top and replacing them with rows of the "averageRowHeight"
    // thus we need to adjust the scrollTop positioning of the infinite container so that the UI doesn't jump as we
    // make the replacements
    let infiniteContainer = React.findDOMNode(this.refs.infiniteContainer);
    let visibleRowsContainer = React.findDOMNode(this.refs.visibleRowsContainer);
    if (this.soonToBeRemovedRowElementHeightDifferences) {
      infiniteContainer.scrollTop = infiniteContainer.scrollTop + this.soonToBeRemovedRowElementHeightDifferences;
    }
    if (this.numberOfRowsAddedToTop) {
      // we're adding rows to the top, so we're going from 100's to random heights, so we'll calculate the differenece
      // and adjust the infiniteContainer.scrollTop by it
      let adjustmentScroll = 0;

      for (let i = 0; i < this.numberOfRowsAddedToTop; i++) {
        let justAddedElement = visibleRowsContainer.children[i];
        if (justAddedElement) {
          // only add height if necessary here
          let index = this.oldRowStart - i - 1;
          if (!this.cache[index]) {
            adjustmentScroll += this.props.averageElementHeight - justAddedElement.getBoundingClientRect().height;
          }
        }
      }
      if (adjustmentScroll) {
        infiniteContainer.scrollTop = infiniteContainer.scrollTop - adjustmentScroll;
      }
    }

    if (!visibleRowsContainer.childNodes[0]) {
      if (this.props.totalNumberOfRows) {
        // we've probably made it here because a bunch of rows have been removed all at once
        // and the visible rows isn't mapping to the row data, so we need to shift the visible rows
        const numberOfRowsToDisplay = this.numberOfRowsToDisplay || 4;
        let newRowStart = this.props.totalNumberOfRows - numberOfRowsToDisplay;
        if (!areNonNegativeIntegers([newRowStart])) {
          newRowStart = 0;
        }
        this.prepareVisibleRows(newRowStart, numberOfRowsToDisplay);
        return; // return early because we need to recompute the visible rows
      }
      throw new Error('no visible rows!!');
    }

    let adjustInfiniteContainerByThisAmount;

    // if a rowJump has been triggered, we need to adjust the row to sit at the top of the infinite container
    if (this.rowJumpTriggered) {
      this.rowJumpTriggered = false;
      if (this.rowJumpedTo === this.state.visibleRows[0]) {
        // we've successfully jumped to that row as the top row!
        // but it probably needs to be adjusted to be centered/at the top of the users viewport
        adjustInfiniteContainerByThisAmount = infiniteContainer.getBoundingClientRect().top - visibleRowsContainer.getBoundingClientRect().top;
        infiniteContainer.scrollTop = infiniteContainer.scrollTop - adjustInfiniteContainerByThisAmount;
      }
    }
    // check if the visible rows fill up the viewport
    // tnrtodo: maybe put logic in here to reshrink the number of rows to display... maybe...
    if (visibleRowsContainer.getBoundingClientRect().height / 2 <= this.props.containerHeight) {
      // visible rows don't yet fill up the viewport, so we need to add rows
      if (this.rowStart + this.state.visibleRows.length < this.props.totalNumberOfRows) {
        // load another row to the bottom
        this.prepareVisibleRows(this.rowStart, this.state.visibleRows.length + 1);
      } else {
        // there aren't more rows that we can load at the bottom so we load more at the top
        if (this.rowStart - 1 > 0) {
          this.prepareVisibleRows(this.rowStart - 1, this.state.visibleRows.length + 1); // don't want to just shift view
        } else if (this.state.visibleRows.length < this.props.totalNumberOfRows) {
          this.prepareVisibleRows(0, this.state.visibleRows.length + 1);
        }
      }
    } 
    else if (visibleRowsContainer.getBoundingClientRect().top > infiniteContainer.getBoundingClientRect().top) {
      // scroll to align the tops of the boxes
      adjustInfiniteContainerByThisAmount = visibleRowsContainer.getBoundingClientRect().top - infiniteContainer.getBoundingClientRect().top;
      // this.adjustmentScroll = true;
      infiniteContainer.scrollTop = infiniteContainer.scrollTop + adjustInfiniteContainerByThisAmount;
    } else if (visibleRowsContainer.getBoundingClientRect().bottom < infiniteContainer.getBoundingClientRect().bottom) {
      // scroll to align the bottoms of the boxes
      adjustInfiniteContainerByThisAmount = visibleRowsContainer.getBoundingClientRect().bottom - infiniteContainer.getBoundingClientRect().bottom;
      // this.adjustmentScroll = true;
      infiniteContainer.scrollTop = infiniteContainer.scrollTop + adjustInfiniteContainerByThisAmount;
    }
    this.cacheSizes();
  },

  componentWillMount() {
    // this is the only place where we use preloadRowStart
    let newRowStart = 0;
    this.cache = {};
    if (this.props.preloadRowStart < this.props.totalNumberOfRows) {
      newRowStart = this.props.preloadRowStart;
    }
    this.prepareVisibleRows(newRowStart, 4);
  },

  componentDidMount() {
    // call componentDidUpdate so that the scroll position will be adjusted properly
    // (we may load a random row in the middle of the sequence and not have the infinte container scrolled properly
    // initially, so we scroll to the show the rowContainer)
    this.componentDidUpdate();
  },

  prepareVisibleRows(rowStart, newNumberOfRowsToDisplay) { // note, rowEnd is optional
    this.numberOfRowsToDisplay = newNumberOfRowsToDisplay;
    if (rowStart + newNumberOfRowsToDisplay > this.props.totalNumberOfRows) {
      this.rowEnd = this.props.totalNumberOfRows - 1;
    } else {
      this.rowEnd = rowStart + newNumberOfRowsToDisplay - 1;
    }
    // var visibleRows = this.state.visibleRowsDataData.slice(rowStart, this.rowEnd + 1);
    // rowData.slice(rowStart, this.rowEnd + 1);
    // setPreloadRowStart(rowStart);
    this.rowStart = rowStart;
    if (!areNonNegativeIntegers([this.rowStart, this.rowEnd])) {
      throw new Error('Error: row start or end invalid!');
    }
    let newVisibleRows = [];
    for (let i = this.rowStart; i <= this.rowEnd; i++) {
      newVisibleRows.push(i);
    }
    // var newVisibleRows = this.rowStart, this.rowEnd + 1);
    if (!this.state || (this.state.visibleRows[0] !== newVisibleRows[0] || this.state.visibleRows[this.state.visibleRows.length-1] !== newVisibleRows[newVisibleRows.length-1])) {
      this.setState({
        visibleRows: newVisibleRows,
      });
    }
  },

  // public method
  getVisibleRowsContainerDomNode() {
    return React.findDOMNode(this.refs.visibleRowsContainer);
  },

  getSizeOf(index) {
    // Try the cache.
    const {cache} = this;
    if (cache[index]) return cache[index];
    if (this.props.averageElementHeight) return this.props.averageElementHeight;
  },

  render() {
    const rowItems = this.state.visibleRows.map((i) => this.props.renderRow(i, i%this.state.visibleRows.length));

    const rowHeight = this.currentAverageElementHeight ? this.currentAverageElementHeight : this.props.averageElementHeight;
    // let space = 0;
    let from = 0;
    // let size = 0;
    this.topSpacerHeight = 0;
    // this.bottomSpacerHeight = 0;
    // const maxFrom = this.props.totalNumberOfRows - 1;

    while (from < this.rowStart) {
      const itemSize = this.getSizeOf(from);
      // if (isNaN(itemSize) || space + itemSize > start) break;
      this.topSpacerHeight += itemSize;
      ++from;
    }
    // while (from < this.rowStart) {
    //   const itemSize = this.getSizeOf(from);
    //   if (isNaN(itemSize) || space + itemSize > start) break;
    //   this.topSpacerHeight += itemSize;
    //   ++from;
    // }

    // const maxSize = length - from;

    // while (size < maxSize && space < end) {
    //   const itemSize = this.getSizeOf(from + size);
    //   if (isNaN(itemSize)) {
    //     size = Math.min(size + pageSize, maxSize);
    //     break;
    //   }
    //   space += itemSize;
    //   ++size;
    // }
    // this.topSpacerHeight = this.rowStart * rowHeight;
    from = this.rowEnd;
    // let size = 0;
    this.bottomSpacerHeight = 0;
    // const maxFrom = this.props.totalNumberOfRows - 1;

    while (from < this.props.totalNumberOfRows - 1) {
      const itemSize = this.getSizeOf(from);
      // if (isNaN(itemSize) || space + itemSize > start) break;
      this.bottomSpacerHeight += itemSize;
      ++from;
    }
    // this.bottomSpacerHeight = (this.props.totalNumberOfRows - 1 - this.rowEnd) * rowHeight;

    const infiniteContainerStyle = {
      height: this.props.containerHeight,
      overflowY: 'scroll',
    };

    return (
      <div
        ref="infiniteContainer"
        className={this.props.containerClassName}
        style={infiniteContainerStyle}
        onScroll={this.onEditorScroll}
      >
        <div className="topSpacer" style={{height: this.topSpacerHeight}}/>
        <div ref="visibleRowsContainer" className="visibleRowsContainer">
          {rowItems}
        </div>
        <div ref="bottomSpacer" className="bottomSpacer" style={{height: this.bottomSpacerHeight}}/>
      </div>
    );
  },
});

export default InfiniteScoller;
