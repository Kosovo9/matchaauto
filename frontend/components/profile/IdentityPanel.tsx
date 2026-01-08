"use client";
import { useEffect, useState } from "react";
import { actions } from "@/shared/core/actions";
import { VerifiedBadge } from "@/components/badges/VerifiedBadge";

export function IdentityPanel() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        actions.identity.fetchStatus().then((s: any) => setStatus(s)).catch(() => setStatus({ status: "none" }));
    }, []);

    const request = async () => {
        setLoading(true);
        try {
            // Hardcoded verified video for P0, in real app this comes from file upload
            await actions.identity.requestVerification("passport", "https://demo.com/doc.mp4");
            const s = await actions.identity.fetchStatus();
            setStatus(s);
        } catch (e) {
            console.error("Verification failed", e);
        } finally {
            setLoading(false);
        }
    };

    if (!status) return <div className="text-sm opacity-50 animate-pulse">Loading identity status...</div>;

    if (status.status === "approved") {
        return (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-emerald-400">Identity Verified</div>
                    <VerifiedBadge />
                </div>
                <div className="text-xs opacity-70">
                    You have full access to premium features and boosts.
                </div>
            </div>
        );
    }

    if (status.status === "pending") {
        return (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold mb-1">Identity Check</div>
                <div className="text-xs text-yellow-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    Pending review
                </div>
            </div>
        );
    }

    if (status.status === "rejected") {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="font-semibold">Identity Rejected</div>
                <div className="text-xs text-red-400 mt-1 mb-3">
                    Reason: {status.review_note || "Information mismatch"}
                </div>
                <button
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
                    onClick={request}
                    disabled={loading}
                >
                    {loading ? "Retrying..." : "Retry Verification"}
                </button>
            </div>
        );
    }

    // status: none
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold mb-1">Get Verified</div>
            <div className="text-xs opacity-60 mb-3 leading-relaxed">
                Unlock premium boosts and build trust with buyers instantly.
            </div>
            <button
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition shadow-lg shadow-emerald-500/20"
                onClick={request}
                disabled={loading}
            >
                {loading ? "Submitting..." : "Verify Identity"}
            </button>
        </div>
    );
}
