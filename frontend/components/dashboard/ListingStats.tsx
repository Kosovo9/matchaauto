"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function ListingStats({ userId }: { userId: string }) {
    return (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle>Listing Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48 flex items-center justify-center text-gray-400">
                    Chart placeholder (View counts, clicks, conversion)
                </div>
            </CardContent>
        </Card>
    )
}
