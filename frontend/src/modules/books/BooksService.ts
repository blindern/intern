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

export interface BookAddData {
  bib_room: string
  bib_section: string
  isbn: string
  title: string
  subtitle: string
  authors: string[]
  pubdate: string
  description: string
  bib_comment: string
}

export interface IsbnSearchResponse {
  isbn: string
  found: boolean
  // TODO: Fix API response when not found
  data: {
    title: string
    subtitle: string | null
    authors: []
    categories: []
    description: string | null
    pubdate: string | null
  } | any[] | null
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

  async addBook(data: BookAddData) {
    const response = await post('books', data)
    return (await response.json()) as Book
  }

  async update(data: BooksResponse['data'][0]) {
    const response = await put(`books/${encodeURIComponent(data._id)}`, data)
    return (await response.json()) as Book
  }

  async deleteBook(id: string) {
    const response = await deleteIt(`books/${encodeURIComponent(id)}`)
    await response.json()
  }

  async setBarcode(id: string, barcode: string) {
    const response = await post(`books/${encodeURIComponent(id)}/barcode`)
    await response.json()
  }

  async isbnSearch(isbn: string) {
    const response = await post('books/isbn', {
      isbn,
    })
    return (await response.json()) as IsbnSearchResponse
  }
}

export const booksService = new BooksService()
