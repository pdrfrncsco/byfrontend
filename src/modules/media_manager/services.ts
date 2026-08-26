import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type { MediaAsset, MediaAssetListResponse, SignedMediaUrl } from './types'

function unwrap<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) return payload.data
  return payload
}

export async function listMediaAssets(params?: { q?: string; asset_type?: string; category?: string }) {
  const response = await apiClient.get<MediaAssetListResponse | ApiResponse<MediaAssetListResponse>>(
    API_ROUTES.MEDIA.LIST,
    { params },
  )
  return unwrap(response.data)
}

export async function uploadMediaAsset(file: File, ownerId: string, ownerType: 'organization' | 'club' | 'player', category = 'gallery') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('owner_type', ownerType)
  formData.append('owner_id', ownerId)
  formData.append('role', category)
  const response = await apiClient.post<ApiResponse<MediaAsset>>(API_ROUTES.MEDIA.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrap(response.data)
}

export async function deleteMediaAsset(id: string) {
  await apiClient.delete(API_ROUTES.MEDIA.DELETE(id))
}

export async function getMediaAssetUrl(asset: MediaAsset) {
  if (asset.public_url) return asset.public_url
  const response = await apiClient.get<ApiResponse<SignedMediaUrl>>(API_ROUTES.MEDIA.SIGNED_URL(asset.id))
  return unwrap(response.data).url
}

export async function getMediaAsset(id: string) {
  const response = await apiClient.get<ApiResponse<MediaAsset>>(API_ROUTES.MEDIA.GET(id))
  return unwrap(response.data)
}