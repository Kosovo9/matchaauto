import { getSupabase } from './supabase';

export const seedListings = async (env: any) => {
    const supabase = getSupabase(env);

    const inventory = [
        {
            title: "Tesla Model S Plaid 2024",
            description: "El auto más rápido del mundo. 0-100 en 2.1s. Full Self Driving activo.",
            make: "Tesla",
            model: "Model S",
            year: 2024,
            price: 2450000,
            category: "VEHICLES",
            images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399"],
            user_id: "quantum-admin"
        },
        {
            title: "Porsche Taycan Turbo S",
            description: "Lujo eléctrico alemán. 750hp de potencia instantánea.",
            make: "Porsche",
            model: "Taycan",
            year: 2023,
            price: 3800000,
            category: "VEHICLES",
            images: ["https://images.unsplash.com/photo-1614205732726-939338755889"],
            user_id: "quantum-admin"
        },
        {
            title: "Motor V8 Hemi 6.2 L",
            description: "Motor completo para Dodge Challenger Hellcat. Nuevo en caja.",
            make: "Mopar",
            model: "Hemi 6.2",
            year: 2024,
            price: 450000,
            category: "PARTS",
            images: ["https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7"],
            user_id: "quantum-admin"
        }
    ];

    const { data, error } = await supabase.from('listings').upsert(inventory);

    if (error) {
        console.error("❌ Error seeding inventory:", error.message);
        return { success: false, error: error.message };
    }

    console.log("✅ Inventory Seeded Successfully!");
    return { success: true, count: inventory.length };
};
