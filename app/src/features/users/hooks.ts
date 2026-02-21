import { useQuery } from "@tanstack/react-query"
import { getUsers, getUser } from "./server-fns.js"

export function useUserList() {
  return useQuery({
    queryKey: ["user", "list"],
    queryFn: () => getUsers(),
  })
}

export function useUser(username: string) {
  return useQuery({
    queryKey: ["user", "item", username],
    queryFn: () => getUser({ data: { username } }),
  })
}
