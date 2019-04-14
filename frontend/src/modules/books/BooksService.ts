import { get, post, put } from 'api'
import { stringify } from 'query-string'

export interface BooksResponse {
  current_page: number
  data: Array<{
    authors: string[]
    bib_barcode: string | null
    bib_comment: string | null
    bib_room: string | null
    bib_section: string | null
    created_at: string
    description: string | null
    isbn: string | null
    isbn_data: object // Do we use this?
    pubdate: string | null
    subtitle: string | null
    thumbnail?: string
    title: string
    updated_at: string | null
    _id: string
  }>
  from: number
  last_page: number
  next_page_url: string | null
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

class BooksService {
  async getList(query: string, page: number) {
    const q = stringify({
      query,
      page,
    })

    const response = await get(`books?${q}`)
    return (await response.json()) as BooksResponse
  }

  async update(data: BooksResponse['data'][0]) {
    const response = await put(`books/${encodeURIComponent(data._id)}`, data)
    // TODO
  }

  async setBarcode(id: string, barcode: string) {
    const response = await post(`books/${encodeURIComponent(id)}/barcode`)
    return (await response.json()) as any // TODO
    // TODO: self.bib_barcode = barcode
  }
}

export const booksService = new BooksService()
