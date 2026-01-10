import AutoHeroHUD from "../../components/auto/AutoHeroHUD";
import RewardsWidget from "../../components/rewards/RewardsWidget";

export default function AutoPage() {
    return (
        <main className="relative">
            <AutoHeroHUD />
            <RewardsWidget />
        </main>
    );
}
