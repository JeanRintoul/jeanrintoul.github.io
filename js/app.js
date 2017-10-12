/**
 * The purpose of this app is to use D3 to visualize a triangular pyramid
 * We demonstrate the use of the pyramid.js library
 */

$(document).ready(function() {

	// generate some data
	var data = generateMoreData();

	// specify a parent DOM element for the pyramid
	var parent = "#visualization";

	var className = "pyramid-2";

	// create a pyramid
	var pyramid = new Pyramid(data, parent, className, true);

	// optionally, you can manually change the relative width of the pyramid
	pyramid.setRelativeWidth(0.75);

	// you can also optionally pass in whatever color scale you want
	//pyramid.setColorScale(d3.scale.category10());

	// adjust the margins, if necessary
	pyramid.setMargins({
		left: 40
	});

	// render the pyramid
	pyramid.render();
});

/**
 * Generates strings to be represented in the slices of each pyramid
 * The order of the slices represents their top-down position in the stack
 * @return {array} Array of strings
 */
function generateData() {

	var data = [];

	// generate a random number between 2 and 10
	var randomCount = Math.random() * 8 + 2;

	var count = Math.round(randomCount);

	for (var i = 0; i < count; i++) {
		data.push("Item " + i);
	}

	return data;
};

/**
 * Generates more string data for a different version of the sample app
 * @return {array} Array of labels
 */
function generateMoreData() {
	var observations = [];
	// observations.push("Communication between Product Owners");
	// observations.push("Sharing of Roadmaps");
	observations.push("Physiological");
	observations.push("Safety");
	observations.push("Love/Belonging");
	observations.push("Esteem");
	observations.push("Self-actualization");
	return observations.reverse();
}