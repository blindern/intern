import { Link } from "@tanstack/react-router"

export function UserLink({ username }: { username: string }) {
  return (
    <Link to="/user/$name" params={{ name: username }}>
      {username}
    </Link>
  )
}
