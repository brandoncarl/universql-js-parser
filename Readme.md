## Introduction

JavaScript parser that transforms [Universql](https://github.com/brandoncarl/universql)
string queries into object queries.

This library should not be used on its own, but rather as part of universql-js

## Installation
```
$ npm install universql-parser
```

## Example
```js
var Parser = require("universql-parser");
var query = Parser.parse("albums{artist,album_name}?artist='Daft Punk'")
```
