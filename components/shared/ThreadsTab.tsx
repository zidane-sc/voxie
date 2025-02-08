import { fetchUserThreads } from "@/lib/actions/user.actions"
import { redirect } from "next/navigation"
import ThreadCard from "../cards/ThreadCard"
import { fetchCommunityThreads } from "@/lib/actions/community.actions"

interface Props {
  currentUserId: string
  accountId: string
  accountType: string
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result: any;

  if (accountType === "Community") {
    result = await fetchCommunityThreads(accountId);
  } else {
    result = await fetchUserThreads(accountId);
  }
  
  return (
    <div className="mt-9 flex flex-col gap-10">
      {result.threads.length === 0 && (
        <p className="text-light-2">No threads found</p>
      )}

      {result.threads.map((thread: any) => (
        <ThreadCard 
          key={thread._id}
          id={thread._id}
          currentUser={currentUserId} 
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? {
                  name: result.name,
                  image: result.image,
                  id: result.id
                }
              : thread.author
          }
          community={thread.community} // todo
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </div>
  )
}

export default ThreadsTab