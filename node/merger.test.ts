import { merge } from "./merger";

describe("merge", () => {
  it("should merge two simple schemas", () => {
    expect(
      merge(
        {
          field1: new Set(["String", "Int32"]),
        },
        {
          field1: new Set(["String", "Int64"]),
        }
      )
    ).toEqual({
      field1: new Set(["String", "Int32", "Int64"]),
    });
  });

  it("should merge two nested schemas", () => {
    expect(
      merge(
        {
          field1: new Set(["String", { field2: new Set(["Int32"]) }]),
        },
        {
          field1: new Set(["String", { field2: new Set(["Int64"]) }]),
        }
      )
    ).toEqual({
      field1: new Set(["String", { field2: new Set(["Int32", "Int64"]) }]),
    });
  });

  it("should not duplicate array types", () => {
    expect(
      merge(
        {
          field1: new Set(["String", [new Set(["Int32"])]]),
        },
        {
          field1: new Set(["String", [new Set(["Int32"])]]),
        }
      )
    ).toEqual({
      field1: new Set(["String", [new Set(["Int32"])]]),
    });
  });

  it("should replace empty array with typed arrays", () => {
    expect(
      merge(
        {
          field1: new Set(["String", []]),
        },
        {
          field1: new Set(["String", [new Set(["Int32"])]]),
        }
      )
    ).toEqual({
      field1: new Set(["String", [new Set(["Int32"])]]),
    });

    expect(
      merge(
        {
          field1: new Set(["String", [new Set(["Int32"])]]),
        },
        {
          field1: new Set(["String", []]),
        }
      )
    ).toEqual({
      field1: new Set(["String", [new Set(["Int32"])]]),
    });
  });

  it("should combine simple array types", () => {
    expect(
      merge(
        {
          field1: new Set(["String", [new Set(["Int32"])]]),
        },
        {
          field1: new Set(["String", [new Set(["Int64"])]]),
        }
      )
    ).toEqual({
      field1: new Set(["String", [new Set(["Int32", "Int64"])]]),
    });
  });

  it("should combine complicated array types", () => {
    const arrayTypes = new Set([{ timestamp: new Set(["Double"]) }, "Int32"]);
    const moreArrayTypes = new Set([
      { timestamp: new Set(["Double"]) },
      "Int64",
    ]);
    const expectedArrayTypes = new Set([
      { timestamp: new Set(["Double"]) },
      "Int32",
      "Int64",
    ]);
    expect(
      merge(
        {
          field1: new Set([[arrayTypes], "Int32"]),
        },
        {
          field1: new Set([[moreArrayTypes]]),
        }
      )
    ).toEqual({
      field1: new Set([[expectedArrayTypes], "Int32"]),
    });
  });

  it("should add Undefined to the types set if a field is missing in either schema", () => {
    expect(
      merge(
        {
          field1: new Set(["String", "Int32"]),
          field2: new Set(["String", "Int64"]),
        },
        {
          field2: new Set(["String", "Int64"]),
          field3: new Set(["Another"])
        }
      )
    ).toEqual({
      field1: new Set(["String", "Int32", "Undefined"]),
      field2: new Set(["String", "Int64"]),
      field3: new Set(["Another", "Undefined"])
    });
  });
});
