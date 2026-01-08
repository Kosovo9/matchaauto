import { MissionControlDashboard } from '../../components/features/admin/MissionControlDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mission Control | Match-Auto 1000x',
    description: 'Central Command for the Match-Auto Global Ecosystem.',
};

export default function MissionControlPage() {
    return (
        <main className="min-h-screen bg-black">
            <MissionControlDashboard />
        </main>
    );
}
