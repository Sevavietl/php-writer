/*!
 * Copyright (C) 2016 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-writer/graphs/contributors
 * @url http://glayzzle.com/php-writer
 */

var parser = require('php-parser');
var filter = require('./helpers/filter');
var editor = require('./helpers/editor');

/**
 * @constructor Function
 */
var fn = function Function(ast) {
  this.ast = ast;
};
editor(fn, 6);

/**
 * Changing the function name
 */
fn.prototype.setName = function(name) {
  this.ast[1] = name;
  return this;
};

/**
 * Changing the function arguments
 */
fn.prototype.setArgs = function(args) {
  var ast = parser.parseEval('function a('+args+') {}');
  this.ast[2] = ast[1][0][2];
  return this;
};

/**
 * Locate the node in the specified ast
 * AST Offsets :
 * name, params, isRef, use, returnType, body
 */
fn.locate = function(ast, name) {
  return filter(ast, 'function', function(node) {
    if (node[1] === name) {
      return new fn(node);
    }
  });
};

module.exports = fn;