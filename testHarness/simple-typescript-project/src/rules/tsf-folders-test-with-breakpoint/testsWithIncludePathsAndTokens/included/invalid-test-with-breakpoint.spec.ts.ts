describe("someTestSuite - OK", () => {
  it("someTest - breakpoint", () => {
    // test code here
    browser2.debug2();
    // ~~~~~~~~ [do not hard code breakpoints in the test (tsf-folders-test-with-breakpoint)]
  });

  it("someTest - OK 2", () => {
    // test code here
  });
});

describe("someTestSuite - OK 2", () => {
  it("someTest - breakpoint", () => {
    // test code here
    browser2.debug2();
    // ~~~~~~~~ [do not hard code breakpoints in the test (tsf-folders-test-with-breakpoint)]
  });

  it("someTest - OK 2", () => {
    // test code here
  });

  describe("someTestSuite - OK", () => {
    it("someTest - breakpoint", () => {
      // test code here
    });

    it("someTest - OK 2", () => {
      // test code here
    });
  });

  // test inside a loop
  [1, 2].forEach(value => {
    describe("someTestSuite", () => {
      it("someTest - OK", () => {
        // test code here
      });

      it("someTest - breakpoint", () => {
        // test code here
        browser2.debug2();
        // ~~~~~~~~ [do not hard code breakpoints in the test (tsf-folders-test-with-breakpoint)]
      });
    });
  });
});
