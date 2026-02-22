import { CommaSeparated } from "./CommaSeparated.js"
import { GroupLink } from "./GroupLink.js"

export function IndirectMemberInfo({
  groupsRelation,
  groupName,
  hasDescription = true,
}: {
  groupsRelation?: Record<string, string[]>
  groupName: string
  hasDescription?: boolean
}) {
  if (!groupsRelation || !(groupName in groupsRelation)) return null
  const groups = groupsRelation[groupName]
  if (groups.includes(groupName)) return null

  return (
    <>
      {hasDescription && <br />}
      <span className="text-muted">
        (Indirekte medlem gjennom{" "}
        <CommaSeparated>
          {groups.map((n) => (
            <GroupLink key={n} groupName={n} />
          ))}
        </CommaSeparated>
        )
      </span>
    </>
  )
}
