// frontend/src/App.tsx
import HeroAuto from './features/auto/HeroAuto';
import HeroMarketplace from './features/marketplace/HeroMarketplace';
import HeroAssets from './features/assets/HeroAssets';
import FImgZoom from './features/media/FImgZoom';
import FGeoNearby from './features/geo/FGeoNearby';
import FARPass from './features/ar/FARPass';

export default function App() {
    return (
        <div className="min-h-screen bg-black">
            {/* TRINITY DIAMOND PROJECT 1: AUTO */}
            <HeroAuto />

            {/* FEATURE SPOTLIGHT: GEOLOCATION */}
            <div className="py-20 bg-black px-6">
                <FGeoNearby />
            </div>

            {/* TRINITY DIAMOND PROJECT 2: MARKETPLACE */}
            <HeroMarketplace />

            {/* FEATURE SPOTLIGHT: HYPER-ZOOM */}
            <div className="py-20 bg-neutral-900 px-6 max-w-5xl mx-auto">
                <FImgZoom media={[
                    { src: '/hero-car.png', type: 'image', alt: 'Electric Sport Car' },
                    { src: '/interior.png', type: 'image', alt: 'Interior Detail' }
                ]} />
            </div>

            {/* TRINITY DIAMOND PROJECT 3: ASSETS */}
            <HeroAssets />

            {/* FEATURE SPOTLIGHT: AR-PASS */}
            <div className="py-40 bg-black">
                <div className="max-w-4xl mx-auto px-6">
                    <FARPass />
                </div>
            </div>
        </div>
    );
}
