import { net } from 'electron/main'

import { ReleaseProps } from '@/shared_app/types'

// Repo coordinates mirror the `publish` section of electron-builder.yml.
const RELEASES_API_URL = 'https://api.github.com/repos/WebAFilippov/af_electron_v40/releases'

interface GithubReleaseDto {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  published_at: string
  draft: boolean
  prerelease: boolean
  html_url: string
}

const normalizeVersion = (tag: string): string => tag.replace(/^v/i, '')

/**
 * Fetches the published releases of the app repository through the main
 * process. Uses Electron's `net` (Chromium stack) so the request works behind
 * proxies and is not subject to renderer CORS restrictions.
 *
 * Returns an empty array when the repository has no published releases or the
 * network is unavailable — the history section is optional information, so a
 * failure must not break the page.
 */
export const getReleases = async (): Promise<ReleaseProps[]> => {
  try {
    const response = await net.fetch(RELEASES_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Effectory-App'
      }
    })

    if (!response.ok) {
      return []
    }

    const releases = (await response.json()) as GithubReleaseDto[]

    if (!Array.isArray(releases)) {
      return []
    }

    return releases
      .filter((release) => !release.draft && release.tag_name)
      .map((release) => ({
        id: release.id,
        version: normalizeVersion(release.tag_name),
        name: release.name,
        notes: release.body,
        publishedAt: release.published_at,
        isPrerelease: release.prerelease,
        htmlUrl: release.html_url
      }))
  } catch {
    return []
  }
}
