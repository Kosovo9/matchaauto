import { UserButton } from '@clerk/nextjs'

export function UserNav({ user }: { user: any }) {
    return (
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {user.firstName || user.username}
                </div>
                <div className="text-xs text-gray-500">{user.emailAddresses[0].emailAddress}</div>
            </div>
            <UserButton afterSignOutUrl="/" />
        </div>
    )
}
