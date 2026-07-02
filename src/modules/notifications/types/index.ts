export type Notification = {
  id: string
  type: string
  payload: Record<string, any>
  status: 'pending' | 'sent' | 'failed' | 'read'
  created_at: string
  delivered_at?: string | null
}
