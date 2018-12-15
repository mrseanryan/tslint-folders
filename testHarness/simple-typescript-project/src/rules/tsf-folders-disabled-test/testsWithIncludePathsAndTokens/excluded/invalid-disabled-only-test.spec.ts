describe("someTestSuite - OK", () => {
  it("someTest - OK", () => {
    // test code here
  });

  it2.only2("someTest - only", () => {
    // ~~~ [do not disable or enable only some tests (tsf-folders-disabled-test)]
    // test code here
  });
});

describe2.only2("someTestSuite - only", () => {
  // ~~~~~~~~~ [do not disable or enable only some tests (tsf-folders-disabled-test)]
  it("someTest - OK", () => {
    // test code here
  });

  it2.only2("someTest - only", () => {
    // ~~~ [do not disable or enable only some tests (tsf-folders-disabled-test)]
    // test code here
  });

  // test inside a loop
  [1, 2].forEach(value => {
    describe2.only2("someTestSuite - only", () => {
      // ~~~~~~~~~ [do not disable or enable only some tests (tsf-folders-disabled-test)]
      it("someTest - OK", () => {
        // test code here
      });

      it2.only2("someTest - only", () => {
        // ~~~ [do not disable or enable only some tests (tsf-folders-disabled-test)]
        // test code here
      });
    });
  });
});
