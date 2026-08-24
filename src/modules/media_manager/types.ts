export type MediaAssetType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'PDF' | 'ARCHIVE'

export interface MediaAsset {
  id: string
  name: string
  asset_type: MediaAssetType
  category: string
  mime_type: string
  size_bytes: number
  thumbnail_url?: string | null
  public_url?: string | null
  status: string
  created_at: string
}

export interface SignedMediaUrl {
  url: string
  is_signed: boolean
  expires_in?: number
}

export interface MediaAssetListResponse {
  count: number
  next: string | null
  previous: string | null
  results: MediaAsset[]
}