import { Button } from '@/components/ui/Button'

export function CTASection() {
    return (
        <section className="py-24 bg-blue-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <h2 className="text-3xl lg:text-5xl font-bold mb-8">Ready to Scale Your Sales 1000x?</h2>
                <p className="text-xl text-blue-100 mb-10">
                    Join the early adopters on the worlds fastest marketplace. Start selling in minutes.
                </p>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 h-14 rounded-2xl">
                    Get Started Now
                </Button>
            </div>
        </section>
    )
}
