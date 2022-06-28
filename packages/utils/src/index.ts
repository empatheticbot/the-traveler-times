// TODO: Look into how generics work in typescript
export function chunkArray<T>(array: T[], chunk: number): T[][] {
	return array.reduce((resultArray: T[][], item, index) => {
		const chunkIndex = Math.floor(index / chunk)

		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = [] // start a new chunk
		}

		resultArray[chunkIndex].push(item)

		return resultArray
	}, []) as T[][]
}

export async function delay(ms: number) {
	return new Promise((resolve) => setTimeout(() => resolve(undefined), ms))
}

export function isAuthorized(req: Request, env: CloudflareEnvironment) {
	return (
		req?.headers?.get('TTT-API-KEY') &&
		req?.headers?.get('TTT-API-KEY') === env.TTT_API_KEY
	)
}

export function getHeaders(env: CloudflareEnvironment) {
	return {
		headers: {
			'TTT-API-KEY': env.TTT_API_KEY,
		},
	}
}
