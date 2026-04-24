import { supabase } from '@/lib/supabase'

export interface StockPhoto {
  id: string
  type: 'image'
  url: string
  thumbnail: string
  preview: string
  width: number
  height: number
  author: string
}

export interface StockVideo {
  id: string
  type: 'video'
  url: string
  thumbnail: string
  width: number
  height: number
  duration: number
  author: string
}

export type StockMedia = StockPhoto | StockVideo

export interface StockSearchResult {
  results: StockMedia[]
  total: number
  page: number
  per_page: number
}

export const mediaStockService = {
  async search(params: {
    query: string
    type: 'image' | 'video'
    page?: number
    per_page?: number
  }): Promise<StockSearchResult> {
    const { data, error } = await supabase.functions.invoke('media-search', {
      body: {
        query: params.query,
        type: params.type,
        page: params.page ?? 1,
        per_page: params.per_page ?? 24,
      },
    })

    if (error) {
      throw new Error(error.message ?? 'Erro ao buscar na biblioteca de mídia.')
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    return data as StockSearchResult
  },
}
