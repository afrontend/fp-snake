const assert = require("assert");
const fpSnake = require("../index.js");

describe("fpSnake", () => {
  it("has a test", () => {
    assert(
      typeof fpSnake.initSnakeTable() === "object",
      "fpSnake should have a test"
    );
  });
});
