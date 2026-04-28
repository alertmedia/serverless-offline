export default function generateHapiPath(path, options, serverless) {
  let hapiPath = path.startsWith("/") ? path : `/${path}`

  if (!options.noPrependStageInUrl) {
    const stage = options.stage || serverless.service.provider.stage
    // prepend the stage to path
    hapiPath = `/${stage}${hapiPath}`
  }

  if (options.prefix) {
    hapiPath = `/${options.prefix}${hapiPath}`
  }

  if (hapiPath !== "/" && hapiPath.endsWith("/")) {
    hapiPath = hapiPath.slice(0, -1)
  }

  hapiPath = hapiPath.replaceAll("+}", "*}")

  return hapiPath
}

export function generateAlbHapiPath(path, options, serverless) {
  // path must start with '/'
  let hapiPath = path.startsWith("/") ? path : `/${path}`

  if (!options.noPrependStageInUrl) {
    const stage = options.stage || serverless.service.provider.stage
    // prepend the stage to path
    hapiPath = `/${stage}${hapiPath}`
  }

  if (options.prefix) {
    hapiPath = `/${options.prefix}${hapiPath}`
  }

  if (
    hapiPath !== "/" &&
    hapiPath.endsWith("/") &&
    !options.noStripTrailingSlashInUrl
  ) {
    hapiPath = hapiPath.slice(0, -1)
  }

  // Translate ALB '*' wildcards to Hapi catchall '{N*}' so multi-segment
  // paths (e.g. /locations/groups/76/346728) match. Plain '{N}' would only
  // match a single segment. A global-regex replace avoids re-matching the
  // '*' we just inserted inside the substitution.
  let albWildcardIndex = 0
  hapiPath = hapiPath.replaceAll("*", () => {
    const placeholder = `{${albWildcardIndex}*}`
    albWildcardIndex += 1
    return placeholder
  })

  return hapiPath
}
