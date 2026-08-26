export type MediaAssetType = 'image' | 'video' | 'document' | 'audio' | 'pdf' | 'archive'

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
  updated_at?: string
  original_filename?: string
  extension?: string
  width?: number | null
  height?: number | null
  owner_type?: string
  owner_id?: string | null
  visibility?: string
  variants?: MediaVariant[]
}

export interface MediaVariant {
  id: string
  variant_type: string
  cdn_url: string
  width?: number | null
  height?: number | null
  size_bytes: number
  mime_type: string
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

export interface MediaUsage {
  id: string
  owner_type: string
  owner_id: string
  role: string
  order: number
  is_active: boolean
  asset: MediaAsset
  created_at: string
}

export interface MediaUsageListResponse {
  count: number
  next: string | null
  previous: string | null
  results: MediaUsage[]
}