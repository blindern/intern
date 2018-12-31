import React from 'react'
import { Link } from 'react-router-dom'

const UserLink = ({ username }: { username: string }) => (
  <Link to={`/user/${encodeURIComponent(username)}`}>{username}</Link>
)

export default UserLink
