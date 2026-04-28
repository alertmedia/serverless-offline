import assert from "node:assert"
import generateHapiPath, { generateAlbHapiPath } from "../generateHapiPath.js"

const serverless = {
  service: {
    provider: {
      stage: "dev",
    },
  },
}

describe("generateHapiPath", () => {
  it("should generate url starting with a slash", () => {
    const options = {}
    const result = generateHapiPath("users", options, serverless)

    assert.equal(result[0], "/")
  })

  it("should generate url with the stage prepended", () => {
    const options = {}
    const result = generateHapiPath("users", options, serverless)

    assert.equal(result, "/dev/users")
  })

  describe("when a prefix option is set", () => {
    it("the url should add the prefix", () => {
      const options = {
        prefix: "some-prefix",
      }
      const result = generateHapiPath("users", options, serverless)

      assert.equal(result, "/some-prefix/dev/users")
    })
  })

  describe("when the noPrependStageInUrl option is set", () => {
    it("the url should omit the stage", () => {
      const options = {
        noPrependStageInUrl: true,
      }
      const result = generateHapiPath("users", options, serverless)

      assert.equal(result, "/users")
    })
  })

  it("the stage from options should override stage from serverless config", () => {
    const options = {
      stage: "prod",
    }
    const result = generateHapiPath("users", options, serverless)

    assert.equal(result, "/prod/users")
  })
})

describe("generateAlbHapiPath", () => {
  it("should translate a trailing wildcard to a Hapi catchall", () => {
    const options = { noPrependStageInUrl: true }
    const result = generateAlbHapiPath("/locations/*", options, serverless)

    assert.equal(result, "/locations/{0*}")
  })

  it("should match multi-segment paths under the wildcard", () => {
    // Regression for MAS-3344: '{N}' only matches a single segment, so
    // '/locations/{0}' rejected '/locations/groups/76/346728' as 404.
    const options = { noPrependStageInUrl: true }
    const result = generateAlbHapiPath("/locations/*", options, serverless)

    assert.ok(
      result.endsWith("{0*}"),
      `expected catchall syntax, got ${result}`,
    )
  })

  it("should translate multiple wildcards independently", () => {
    const options = { noPrependStageInUrl: true }
    const result = generateAlbHapiPath("/foo/*/bar/*", options, serverless)

    assert.equal(result, "/foo/{0*}/bar/{1*}")
  })

  it("should prepend stage when not suppressed", () => {
    const options = {}
    const result = generateAlbHapiPath("/locations/*", options, serverless)

    assert.equal(result, "/dev/locations/{0*}")
  })

  it("should prepend prefix and stage", () => {
    const options = { prefix: "api" }
    const result = generateAlbHapiPath("/locations/*", options, serverless)

    assert.equal(result, "/api/dev/locations/{0*}")
  })

  it("should leave paths without wildcards untouched", () => {
    const options = { noPrependStageInUrl: true }
    const result = generateAlbHapiPath("/users", options, serverless)

    assert.equal(result, "/users")
  })
})
