"use strict";

var ownerInput;

exports.r = function repeatedAttrTag(targetProperty, attrTagInput) {
  var prev = ownerInput[targetProperty];
  if (prev) {
    prev.push(attrTagInput);
  } else {
    ownerInput[targetProperty] = [attrTagInput];
  }
};

// eslint-disable-next-line no-constant-condition
var rest = "MARKO_DEBUG" ? Symbol("Attribute Tag") : Symbol();
var empty = [];
exports.a = function repeatableAttrTag(targetProperty, attrTagInput) {
  var prev = ownerInput[targetProperty];
  var prevRest = prev && prev[rest];
  if (prevRest) {
    if (prevRest === empty) {
      prev[rest] = [attrTagInput];
    } else {
      prevRest.push(attrTagInput);
    }
  } else {
    attrTagInput[Symbol.iterator] = attributeTagIterator;
    attrTagInput[rest] = empty;
    ownerInput[targetProperty] = attrTagInput;
  }
};

exports.i = function attrTagInput(render, input) {
  var prevOwnerInput = ownerInput;
  ownerInput = input || {};
  try {
    var renderBody = render();
    if (renderBody) {
      ownerInput.renderBody = renderBody;
    }
    return ownerInput;
  } finally {
    ownerInput = prevOwnerInput;
  }
};

function* attributeTagIterator() {
  yield this;
  yield* this[rest];
}
