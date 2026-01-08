"use client";
import React from "react";

type Props = {
    items: React.ReactNode[];
    columns?: number; // desktop cols
};

export default function MasonryGrid({ items, columns = 4 }: Props) {
    // CSS columns = masonry real, rápido y cero deps
    return (
        <div
            className="gap-4"
            style={{
                columnCount: columns,
                columnGap: "16px",
            }}
        >
            {items.map((node, i) => (
                <div key={i} style={{ breakInside: "avoid" as any, marginBottom: 16 }}>
                    {node}
                </div>
            ))}
        </div>
    );
}
