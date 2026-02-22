export function Pagination({
  firstPage,
  prevPage,
  nextPage,
  lastPage,
  currentPage,
  totalPages,
}: {
  firstPage: () => void
  prevPage: () => void
  nextPage: () => void
  lastPage: () => void
  currentPage: number
  totalPages: number
}) {
  return (
    <nav className="text-center">
      <ul className="pagination center">
        <li>
          <a onClick={firstPage}>&laquo;</a>
        </li>
        <li>
          <a onClick={prevPage}>&lsaquo;</a>
        </li>
        <li>
          <a>
            {currentPage}/{totalPages}
          </a>
        </li>
        <li>
          <a onClick={nextPage}>&rsaquo;</a>
        </li>
        <li>
          <a onClick={lastPage}>&raquo;</a>
        </li>
      </ul>
    </nav>
  )
}
