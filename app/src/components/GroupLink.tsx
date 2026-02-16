import { Link } from "@tanstack/react-router"
import { groupUrl } from "../utils/urls.js"

export function GroupLink({ groupName }: { groupName: string }) {
  return <Link to={groupUrl(groupName)}>{groupName}</Link>
}
