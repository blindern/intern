import React from 'react'
import { Link } from "react-router-dom";

const GroupLink = ({ groupName }: { groupName: string}) => (
  <Link to={`/group/${encodeURIComponent(groupName)}`}>{groupName}</Link>
)

export default GroupLink
