import React from "react"

interface Props {
  firstPage(): void
  prevPage(): void
  nextPage(): void
  lastPage(): void
  currentPage: number
  totalPages: number
}

export function Pagination(props: Props) {
  return (
    <nav className="text-center">
      <ul className="pagination center">
        <li>
          <a
            onClick={() => {
              props.firstPage()
            }}
          >
            &laquo;
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              props.prevPage()
            }}
          >
            &lsaquo;
          </a>
        </li>
        <li>
          <a>
            {props.currentPage}/{props.totalPages}
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              props.nextPage()
            }}
          >
            &rsaquo;
          </a>
        </li>
        <li>
          <a
            onClick={() => {
              props.lastPage()
            }}
          >
            &raquo;
          </a>
        </li>
      </ul>
    </nav>
  )
}
