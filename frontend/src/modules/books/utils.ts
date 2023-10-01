import { Book } from "modules/books/api.js"

export function bookTitle(book: Book) {
  return (
    (book.title ?? "Ukjent tittel") +
    (book.subtitle ? `: ${book.subtitle}` : "")
  )
}
