interface BungieAPIManifestResponse {
  Response: BungieD2Manifest
}

interface BungieD2Manifest {
  jsonWorldComponentContentPaths: {
    en: { [index: string]: string }
  }
  jsonWorldContentPaths: {
    en: string
  }
}

interface BungieD2PGCRResponse {}

interface BungieAPIPGCRResponse {
  Message: string
  Response: BungieD2PGCRResponse
  ErrorStatus: BungieErrorStatus
}

interface BungieD2CharacterMilestoneResponse {
  characterProgressions?: {
    data: { [index: string]: { milestones: unknown } }
  }
}

interface BungieAPICharacterMilestoneResponse {
  Message: string
  Response: BungieD2CharacterMilestoneResponse
  ErrorStatus: BungieErrorStatus
}

type BungieD2Definition = string
