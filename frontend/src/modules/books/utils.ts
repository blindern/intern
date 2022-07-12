import { Book } from "modules/books/api"

export function bookTitle(book: Book) {
  return (
    (book.title ?? "Ukjent tittel") +
    (book.subtitle ? `: ${book.subtitle}` : "")
  )
}
