export function WelcomeBanner({ user }: { user: any }) {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">Powering your growth, {user.firstName}!</h2>
            <p className="text-blue-100 max-w-xl">
                Your current K-Factor is 1.25. You are in the top 5% of viral users this week!
                Keep sharing to increase your rewards.
            </p>
        </div>
    )
}
