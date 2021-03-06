/**

  Universql Parser
  Copyright 2016 Brandon Carl
  MIT Licensed

  Instance methods:
  • parseFilter
  • parseFilters
  • parseOptions

**/


//
//  Dependencies
//

var Parser = require("./parser");



//
//  Exports
//

module.exports = {
  parse: function(str) {
    return new Query(str);
  }
};


var Query = function(str) {

  var query = Parser.parse(str);

  // Ensure we have a table!
  if (!query.tables) throw new Error("Query must have a table");

  this.tables = query.tables;
  this.map = query.map || {};

  // Parse options and filters
  this.parseOptions(query.options);
  this.parseFilters(query.filters || []);

};



/**

  Parses query options, which currently consist of `sort` and `limit`.
  Attaches the results to the class object (e.g. this.sort, this.limit).

  @param {Array} options Array of {key, value} options.

**/

Query.prototype.parseOptions = function(options) {

  var key, val;

  options = options || [];

  // Walk through options. Each option is of format {key, value}
  for (var i = 0, n = options.length; i < n; i++) {

    key = options[i].type;
    val = options[i].value;

    switch (key) {
      case "sort":
        this.sort = val;
        break;
      case "limit":
        this.limit = parseInt(val);
        if (isNaN(this.limit)) this.limit = val;
        break;
      case "skip":
        this.skip = parseInt(val);
        if (isNaN(this.skip)) this.skip = val;
        break;
      default:
        throw new Error("Unknown option in query: " + key);
    }
  }

};



/**

  Parses filters and attaches actionable Reverse Polish Notation to this.filters.

  There are two forms of steps: Operations and Statements.

  An Operation consists of an operator (&, |) and operands (array of statements).
  A Statement consists of a key, a comparator, and a value (e.g. test key = value).

  @param {Object} filters Operations/Statements generated by parser.

**/

Query.prototype.parseFilters = function(filters) {

  // Initialize
  this.filters = [];

  // Start recursive calls
  while (filters.length) {
    this.parseFilter(filters.shift() || []);
  }

  // Reverse (into Revere Polish Notation)
  this.filters = this.filters.reverse();

};


/**

  Recursive step that drives parseFilters.

  @param {Object} step An Operation or a Statement.

**/

Query.prototype.parseFilter = function(step) {

  // If there are no operands, this must be an execution statement
  if (!step.operands) {
    if (Object.keys(step).length) {
      if (step.value && step.value.type === 'literal')
        step.value = step.value.value;
      this.filters.push(step);
    }
    return;
  }

  // Single operands don't require operators
  if (step.operands.length < 2)
    this.parseFilter(step.operands[0]);

  // Push to stack in format that will allow Reverse Polish Notation
  // Namely, we want + A + B + C D, which, when reversed yields D C + B + A +
  else {
    for (var i = 0, n = step.operands.length - 1; i < n; i++) {
      this.filters.push(step.operator);
      this.parseFilter(step.operands[i]);
    }
    this.parseFilter(step.operands[i]);
  }

};
