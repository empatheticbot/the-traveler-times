interface CloudflareEnvironment {
  DESTINY_2_CRUCIBLE_META: KVNamespace
  DESTINY_2_MANUAL_DATA: KVNamespace
  BUNGIE_API: KVNamespace
  PGCR_DURABLE_OBJECT: DurableObjectNamespace
  TWITTER_API: KVNamespace
  TTT_API_KEY: string
  ACCOUNT_ID: string
  PAGES_ID: string
  SECRET_AUTH_KEY: string
  SECRET_AUTH_EMAIL: string
}

interface CloudflareDeployment {
  created_on: string
  id: string
}
