const assert = require("assert");
const fpSnake = require("../index.js");

describe("fpSnake", () => {
  it("has a test", () => {
    assert(typeof fpSnake.init() === "object", "fpSnake should have a test");
  });
});
