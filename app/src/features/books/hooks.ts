import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  setBookBarcode,
  lookupIsbn,
} from "./server-fns.js"

export type Book = NonNullable<Awaited<ReturnType<typeof getBook>>>
export type BookListResponse = Awaited<ReturnType<typeof getBooks>>

export interface BookInput {
  title: string
  subtitle?: string | null
  authors?: string[] | null
  pubdate?: string | null
  description?: string | null
  isbn?: string | null
  bib_comment?: string | null
  bib_room?: string | null
  bib_section?: string | null
}

function buildBookKey(id: string) {
  return ["books", "item", id]
}

export function useBookList(variables?: { q?: string; page?: number }) {
  return useQuery({
    queryKey: ["books", "list", variables],
    queryFn: () =>
      getBooks({ data: { page: variables?.page, q: variables?.q } }),
  })
}

export function useBook(id: string) {
  return useQuery({
    queryKey: buildBookKey(id),
    queryFn: () => getBook({ data: { id } }),
  })
}

export function useUpdateBookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string } & BookInput) => {
      await updateBook({ data: input })
    },
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: buildBookKey(input.id) })
    },
  })
}

export function useSetBookBarcodeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      bookId,
      barcode,
    }: {
      bookId: string
      barcode: string
    }) => {
      await setBookBarcode({ data: { id: bookId, barcode } })
    },
    onSuccess: async (_, { bookId }) => {
      await queryClient.invalidateQueries({ queryKey: buildBookKey(bookId) })
    },
  })
}

export function useDeleteBookMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBook({ data: { id } })
    },
  })
}

export function useCreateBookMutation() {
  return useMutation({
    mutationFn: async (input: BookInput) => {
      return createBook({ data: input })
    },
  })
}

export function useSearchIsbnMutation() {
  return useMutation({
    mutationFn: async (isbn: string) => {
      return lookupIsbn({ data: { isbn } })
    },
  })
}
