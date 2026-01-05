export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Product</h3>
                        <ul className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-400">
                            <li>Marketplace</li>
                            <li>Features</li>
                            <li>Roadmap</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
                        <ul className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-400">
                            <li>Help Center</li>
                            <li>Guidelines</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
                        <ul className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-400">
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm text-gray-500">
                    <p>© 2026 Match-Auto. All rights reserved.</p>
                    <div className="flex gap-4">
                        <span>Twitter</span>
                        <span>Discord</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
