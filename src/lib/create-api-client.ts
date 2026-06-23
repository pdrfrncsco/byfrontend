import axios from 'axios'

export const createApiClient = (baseURL: string = import.meta.env.VITE_API_BASE_URL) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
