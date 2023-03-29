import { writeFile } from "fs/promises";

import { readFileSync } from "fs";

import { parse } from "./parser";
import { merge } from "./merger";

const data = readFileSync("../schema-array.json", "utf8");
// import schema_array from "../schema-array.json";

const schemaArray = JSON.parse(data);

async function main() {
  const combined_schema = combine_schemas(schemaArray);
  await writeFile(
    "combined-schema.json",
    JSON.stringify(combined_schema, null, 2)
  );
}

/**
 * Recurse through the schema array and combine all the fields' values into a set
 * Rules:
 * - If a field is new, add undefined to the set
 *
 * **Example**:
 *
 * ```json
 * [
 *  {
 *   "field1": ["String", "Int32"]
 *  },
 *  {
 *  "field1": ["String", "Null"],
 *  "field2": [{
 *     "field3": [["String"], "String"]
 *    },
 *    "Boolean"
 *   ]
 *  }
 * ]
 * ```
 *
 * Should become:
 *
 * ```json
 * {
 *   "field1": ["String", "Int32", "Null"],
 *   "field2": [
 *     "Undefined",
 *     {
 *     "field3": [["String"], "String"]
 *     },
 *    "Boolean"
 *   ]
 * }
 * ```
 */

type SchemaValue =
  | "Double"
  | "String"
  | "Boolean"
  | "Null"
  | "Int32"
  | "Int64"
  | "ObjectId"
  | "DateTime"
  | "Undefined" // Not in array, but added in final schema
  | SchemaValue[]
  | { [key: string]: SchemaValue };

type Schema = { [key: string]: SchemaValue[] };

// If key is missing in schema, add whole json value
// If key is missing in json, add "Undefined" to schema

function combine_schemas(json_array: Schema[]): Record<string, unknown> {
  // Add first schema without "Undefined"s
  let result: Record<string, unknown> = json_array[0];

  const parsed = json_array.map(parse);

  // Skip first schema
  for (const schema of parsed.slice(1)) {
    result = merge(result, schema);
  }
  return result;
}

main();
