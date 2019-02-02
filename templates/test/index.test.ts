import { sayHi } from "../src";

describe("sayHi", () => {
  it("should say Hi to the given name", () =>
    expect(sayHi("Bob")).toEqual("Hi Bob!"));
});
