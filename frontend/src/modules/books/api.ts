import { useApiService } from 'modules/core/api/ApiServiceProvider'
import { useMutation, useQuery, useQueryClient } from 'react-query'

export interface Book {
  _id: string
  title?: string | null
  subtitle?: string | null
  authors?: string[]
  pubdate?: string | null
  description?: string | null
  isbn?: string | null
  bib_comment?: string | null
  bib_room?: string | null
  bib_section?: string | null
  isbn_data?: {
    [field: string]: any
    industryIdentifiers?: { type: string; identifier: string }[]
  }
  thumbnail?: string | null
  updated_at: string
  created_at: string
  bib_barcode: string | null
}

export interface BookListResponse {
  total: number
  per_page: number
  current_page: number
  last_page: number
  next_page_url: string | null
  prev_page_url: string | null
  from: number
  to: number
  data: Book[]
}

export type CreateBookPayload = Omit<Book, '_id' | 'updated_at' | 'created_at'>

interface SearchIsbnResult {
  isbn?: string
  found: boolean
  data?: {
    title?: string | null
    subtitle?: string | null
    authors?: string[]
    categories?: string[]
    description?: string | null
    pubdate?: string | null
  }
}

export function useBookList(variables?: { q?: string; page?: number }) {
  const api = useApiService()
  return useQuery(['books', 'list', variables], async () => {
    const params = new URLSearchParams()
    if (variables?.q !== undefined) params.set('q', variables.q)
    if (variables?.page !== undefined)
      params.set('page', String(variables.page))
    const response = await api.get(`books?${params.toString()}`)
    return (await response.json()) as BookListResponse
  })
}

function buildBookKey(id: string) {
  return ['books', 'item', id]
}

export function useBook(id: string) {
  const api = useApiService()
  return useQuery(buildBookKey(id), async () => {
    const response = await api.get('books/' + encodeURIComponent(id))
    return (await response.json()) as Book
  })
}

export function useUpdateBookMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (book: Book) => {
      await api.put('books/' + encodeURIComponent(book._id), book)
    },
    {
      onSuccess: async (_, book) => {
        await queryClient.invalidateQueries(buildBookKey(book._id))
      },
    },
  )
}

export function useSetBookBarcodeMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async ({ book, barcode }: { book: Book; barcode: string }) => {
      const response = await api.post(
        'books/' + encodeURIComponent(book._id) + '/barcode',
        {
          barcode,
        },
      )
      if (!response.ok) {
        console.log(response)
        throw new Error('Response failed')
      }
    },
    {
      onSuccess: async (_, { book }) => {
        await queryClient.invalidateQueries(buildBookKey(book._id))
      },
    },
  )
}

export function useDeleteBookMutation() {
  const api = useApiService()
  return useMutation(async (book: Book) => {
    const response = await api.delete('books/' + encodeURIComponent(book._id))
    if (!response.ok) {
      console.log(response)
      throw new Error('Response failed')
    }
  })
}

export function useCreateBookMutation() {
  const api = useApiService()
  return useMutation(async (book: CreateBookPayload) => {
    const response = await api.post('books', book)
    return (await response.json()) as Book
  })
}

export function useSearchIsbnMutation() {
  const api = useApiService()
  return useMutation(async (isbn: string) => {
    const response = await api.post('books/isbn', {
      isbn,
    })
    return (await response.json()) as SearchIsbnResult
  })
}
