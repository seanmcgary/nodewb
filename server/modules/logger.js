
var pad_message = module.exports.pad_message = function(string, width){
	string = "" + string;
	
	var output = '[';

	var total_width = width + 7;

	string = string.substring(0, width);

	output += string + ']';

	var string_len = string.length;

	var needed_length = total_width - string_len;

	for(var i = 0; i < needed_length; i++){
		output += " ";
	}

	return output;
};