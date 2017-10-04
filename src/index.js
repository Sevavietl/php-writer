/*!
 * Copyright (C) 2017 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-writer/graphs/contributors
 * @url http://glayzzle.com/php-writer
 */
'use strict';

var parser = require('php-parser');
var unparser = require('php-unparser');
var editor = require('./helpers/editor');

var Namespace = require('./namespace');
var Class = require('./class');
var fn = require('./function');
var Interface = require('./interface');
var Trait = require('./trait');

// Parser default options
var defaultOptions = {
  writer: {
    indent: true,
    dontUseWhitespaces: false,
    shortArray: true,
    forceNamespaceBrackets: false,
    bracketsNewLine: true
  },
  parser: {
    debug: false, 
    locations: false,
    extractDoc: true,
    suppressErrors: false
  },
  lexer: {
    all_tokens: false,
    comment_tokens: false,
    mode_eval: false,
    asp_tags: false,
    short_tags: false
  },
  ast: {
    withPositions: true
  }
};

/**
 * @varructor
 */
var Writer = function(buffer, options = {}) {
  options = Object.assign({}, defaultOptions, options);
  this.ast = parser.parseCode(buffer, options);
};
editor(Writer, 1);

/**
 * Finds a namespace
 * @param {String} name
 * @return {Namespace|Null}
 */
Writer.prototype.findNamespace = function(name) {
  return Namespace.locate(this.ast.children, name);
};

/**
 * Locates the object namespace
 * @param {String} name
 * @return {Namespace|Null}
 */
Writer.prototype.nsLocator = function(name) {
  name = name.trim('\\').split('\\');
  if (name.length > 1) {
    var cName = name.pop();
    return [cName, this.findNamespace(name.join('\\'))];
  } else {
    return [name[0], this.findNamespace('')];
  }
};

/**
 * Finds a class
 * @param {String} name
 * @return {Class|Null}
 */
Writer.prototype.findClass = function(name) {
  var ns = this.nsLocator(name);
  if (ns[1]) return ns[1].findClass(ns[0]);
  return Class.locate(this.ast.children, ns[0]);
};

/**
 * Finds a function
 * @param {String} name
 * @return {Function|Null}
 */
Writer.prototype.findFunction = function(name) {
  var ns = this.nsLocator(name);
  if (ns[1]) return ns[1].findFunction(ns[0]);
  return fn.locate(this.ast.children, ns[0]);
};

/**
 * @param {String} name
 * @return {Trait|Null}
 */
Writer.prototype.findTrait = function(name) {
  var ns = this.nsLocator(name);
  if (ns[1]) return ns[1].findTrait(ns[0]);
  return Trait.locate(this.ast.children, ns[0]);
};

/**
 * @param {String} name
 * @return {Interface|Null}
 */
Writer.prototype.findInterface = function(name) {
  var ns = this.nsLocator(name);
  if (ns[1]) return ns[1].findInterface(ns[0]);
  return Interface.locate(this.ast.children, ns[0]);
};

/**
 * Convert back AST to php code
 * @return {String}
 */
Writer.prototype.toString = function() {
  return unparser(this.ast, {
    forceNamespaceBrackets: true,
    shortArray: false
  });
};

module.exports = Writer;
