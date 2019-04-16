import { deleteIt, get, post, put } from 'api'
import { stringify } from 'query-string'

export interface Book {
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
}

export interface BooksResponse {
  current_page: number
  data: Book[]
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

  async getBook(id: string) {
    const response = await get(`books/${encodeURIComponent(id)}`)
    return (await response.json()) as Book
  }

  async update(data: BooksResponse['data'][0]) {
    const response = await put(`books/${encodeURIComponent(data._id)}`, data)
    // TODO
  }

  async deleteBook(id: string) {
    const response = await deleteIt(`books/${encodeURIComponent(id)}`)
    await response.json()
  }

  async setBarcode(id: string, barcode: string) {
    const response = await post(`books/${encodeURIComponent(id)}/barcode`)
    await response.json()
  }
}

export const booksService = new BooksService()
