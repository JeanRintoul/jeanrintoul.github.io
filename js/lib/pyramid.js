/**
 * This library leverages D3 to build a pyramid
 * The user specifies the data to be displayed in the pyramid
 * Each layer of the pyramid has some text in it
 */

/**
 * Defines a pyramid object
 * @param {array} data             Array of strings in the top down order
 * @param {string} parentContainer CSS selector for the parent container
 * @param {string} className        Name of the class representing the pyramid SVG
 * @param {string} autoFit        Whether the pyramid should make a best effort fit in the parent container
 * @param {string} colorScale        D3 color scale to apply to the pyramid
 */
function Pyramid(data, parentContainer, className, autoFit, colorScale) {

	if (!data) console.error("We have no data to put into the pyramid!");

	if (!parentContainer) console.error("A parent element has not been specified!");

	// store a reference to the data
	this.data = data;

	// default baseToHeightRatio (a 3-4-5 right triangle!)
	this.baseToHeightRatio = 3/4;

	// the DOM element into which the pyramid will go
	this.parentContainer = parentContainer || null;

	// reference to dimensions object
	var parent = document.getElementById(parentContainer.split("#")[1]);
	var style = window.getComputedStyle(parent, null)
	var height = style.getPropertyValue("height").split("px")[0];
	var width = style.getPropertyValue("width").split("px")[0];

	this.dimensions = {
		outerHeight: height,
		outerWidth: width
	};

	// reference to the margins object
	this.dimensions.margins = {
		top: 25,
		bottom: 25,
		left: 25,
		right: 25
	};

	// name of class representing the pyramid SVG
	this.className = className || "pyramid";

	// determines whether to auto-fit the pyramid in the container
	this.autoFit = (autoFit == false) ? false : true;

	// default color scale
	this.colorScale = colorScale || d3.scale.category20();
}

/**
 * Sets the D3 color scale
 * @param {object} colorScale A D3 Color Scale
 */
Pyramid.prototype.setColorScale = function(colorScale) {

	if (!colorScale) console.error("No color scale has been specified!");

	this.colorScale = colorScale;
};

/**
 * Sets the DOM element into which the pyramid will go
 * User must take care to specify an appropriately specific DOM element
 *
 * The DOM element must have a width and height specified
 *
 * @param {string} parentContainer DOM Element CSS Selector
 */
Pyramid.prototype.setParentContainer = function(parentContainer) {

	if (!parentContainer) console.error("No parent container element has been specified!");

	this.parentContainer = parentContainer;
};

/**
 * Sets the name of the class representing the pyramid
 * If not set, the default is "pyramid"
 * @param {string} className Name of the class for the pyramid SVG
 */
Pyramid.prototype.setClassName = function(className) {

	if (!className) console.error("No class name has been specified!");

	this.className = className;
};

/**
 * Sets the base to height ratio for displaying the Pyramid
 * Controls the relative width of the triangle
 * Use 1 for equal base and height (45-degrees)
 * Use 4/3 for 3,4,5 right triangles
 * @param {number} ratio Ratio of base length to height for each slice in pyramid
 */
Pyramid.prototype.setRelativeWidth = function(ratio) {

	if (!ratio) console.error("No relative width has been specified!");

	this.baseToHeightRatio = ratio;
};

/**
 * Sets the autofit behavior.
 * @param  {boolean} autoFit Whether to auto-fit the pyramid into its parent container
 * @return {void}
 */
Pyramid.prototype.autoFit = function(autoFit) {
	this.autoFit = autoFit;
};

/**
 * Returns the baseToHeightRatio based on the parent setDimensions
 * @return {number} Ratio of base to height that fits the container
 */
Pyramid.prototype.calcBaseToHeightRatio = function() {

	var maxWidth = this.dimensions.chart.width;
	var maxHeight = this.dimensions.chart.height;

	return maxWidth / 2 / maxHeight;
};

/**
 * Generates an array of points defining the boundaries of a slice in the pyramid
 * The path generator using these points should close the path
 * @param  {number} arrayIndex  Array index
 * @param  {number} center      Horizontal center of the chart
 * @param  {number} sliceHeight The height of each layer of the pyramid
 * @return {array}             Points associated with a single pyramid layer
 */
Pyramid.prototype.generatePoints = function(arrayIndex, center, sliceHeight) {

	var self = this;
	var points = [];

	// create 3 vertices of a triangle
	points.push({
		x: center,
		y: 0
	});

	// bottom-left vertex
	points.push({
		x: center - (arrayIndex + 1) * self.baseToHeightRatio * sliceHeight,
		y: sliceHeight * (arrayIndex + 1)
	});

	// bottom-right vertex
	points.push({
		x: center + (arrayIndex + 1) * self.baseToHeightRatio * sliceHeight,
		y: sliceHeight * (arrayIndex + 1)
	});

	return points;
};

/**
 * Sets the margins of the pyramid
 * @param {object} margins Margins
 */
Pyramid.prototype.setMargins = function(margins) {

	if (!margins) console.error("No margins have been specified!");

	if (margins.top)
		this.dimensions.margins.top = margins.top;

	if (margins.bottom)
		this.dimensions.margins.bottom = margins.bottom;

	if (margins.left)
		this.dimensions.margins.left = margins.left;

	if (margins.right)
		this.dimensions.margins.right = margins.right;
};

/**
 * Sets the dimensions of the pyramid
 */
Pyramid.prototype.setDimensions = function() {

	this.dimensions.innerHeight = this.dimensions.outerHeight - this.dimensions.margins.top - this.dimensions.margins.bottom;
	this.dimensions.innerWidth = this.dimensions.outerWidth - this.dimensions.margins.left - this.dimensions.margins.right;

	this.dimensions.chart = {};

	this.dimensions.chart.width = this.dimensions.innerWidth;
	this.dimensions.chart.height = this.dimensions.innerHeight;
};

/**
 * Renders the visualization
 * @return {void}
 */
Pyramid.prototype.render = function() {

	var self = this;

	// the triangles overlap each other so draw the largest first and
	// the smaller ones on top of those
	var reversed = this.data.reverse();
	self.setDimensions();

	// draw the svg
	d3.selectAll("." + this.className).empty();

	var svg = d3.select(this.parentContainer)
		.append("svg")
		.attr({
			class: self.className,
			width: self.dimensions.outerWidth,
			height: self.dimensions.outerHeight
		});

	var canvas = svg.append("g")
		.attr({
			width: self.dimensions.innerWidth,
			height: self.dimensions.innerHeight,
			transform: "translate(" + self.dimensions.margins.left + "," + self.dimensions.margins.top + ")",
			class: self.className
		});

	var center = self.dimensions.chart.width / 2;
	var sliceHeight = self.dimensions.chart.height / self.data.length;

	var line = d3.svg.line()
    	.x(function(d) { return d.x; })
    	.y(function(d) { return d.y; })
    	.interpolate("linear");

	// set the baseToHeight ratio
	if (this.autoFit) {
		this.setRelativeWidth(this.calcBaseToHeightRatio());
	}

	// draw triangles and render text labels
	// plot points
	canvas.selectAll("path.triangle")
		.data(reversed)
			.enter()
				.append("path")
				.attr({
					d: function(d, i) {
						// generate points
						var points = self.generatePoints(reversed.length - i - 1, center, sliceHeight);
						return line(points) + "Z";
					},
					class: "slice triangle",
					fill: function(d, i) {
						return self.colorScale(d);
					}
				});

	// render text labels
	// Be sure to style the labels in an external style sheet
	canvas.selectAll("text.pyramid-label")
		.data(reversed)
			.enter()
				.append("text")
				.text(function(d, i) {
					return d;
				})
				.attr({
					x: center,
					y: function(d, i) {
						return (reversed.length - i) * sliceHeight - sliceHeight / 2.5;
					},
					class: "pyramid-label"
				});
};