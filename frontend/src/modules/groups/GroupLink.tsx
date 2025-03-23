import { Link } from "react-router-dom"

export const GroupLink = ({ groupName }: { groupName: string }) => (
  <Link to={`/group/${encodeURIComponent(groupName)}`}>{groupName}</Link>
)
