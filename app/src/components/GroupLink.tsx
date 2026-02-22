import { Link } from "@tanstack/react-router"

export function GroupLink({ groupName }: { groupName: string }) {
  return (
    <Link to="/group/$name" params={{ name: groupName }}>
      {groupName}
    </Link>
  )
}
