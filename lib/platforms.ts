export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'youtube'

export function detectPlatform(url: string): Platform | null {
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'instagram'
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) return 'facebook'
  if (url.includes('tiktok.com') || url.includes('vm.tiktok')) return 'tiktok'
  if (url.includes('youtube.com/shorts') || url.includes('youtu.be') || url.includes('youtube.com')) return 'youtube'
  return null
}

export function cleanUrl(url: string, platform: Platform): string {
  const base = url.split('?')[0].split('#')[0]

  if (platform === 'tiktok') {
    return base
  }

  if (platform === 'instagram') {
    return base.endsWith('/') ? base : base + '/'
  }

  return base
}
