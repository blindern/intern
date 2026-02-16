import { Link } from "@tanstack/react-router"
import { userUrl } from "../utils/urls.js"

export function UserLink({ username }: { username: string }) {
  return <Link to={userUrl(username)}>{username}</Link>
}
