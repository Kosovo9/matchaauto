'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for icon issues in Next.js
if (typeof window !== 'undefined') {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
}

interface GeofenceEditorProps {
    onGeofenceCreated: (geofence: any) => void;
}

export default function GeofenceEditor({ onGeofenceCreated }: GeofenceEditorProps) {
    const map = useMap();
    const drawControlRef = useRef<L.Control.Draw | null>(null);
    const featureGroupRef = useRef<L.FeatureGroup>(new L.FeatureGroup());

    useEffect(() => {
        // Ensure leaflet-draw is loaded (client side)
        require('leaflet-draw');

        map.addLayer(featureGroupRef.current);

        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: featureGroupRef.current,
                remove: true
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: { color: '#3b82f6', fillOpacity: 0.2 }
                },
                circle: {
                    shapeOptions: { color: '#ef4444', fillOpacity: 0.2 }
                },
                rectangle: {
                    shapeOptions: { color: '#10b981', fillOpacity: 0.2 }
                },
                marker: false,
                polyline: false,
                circlemarker: false
            }
        });

        map.addControl(drawControl);
        drawControlRef.current = drawControl;

        const onCreated = (e: any) => {
            const layer = e.layer;
            featureGroupRef.current.addLayer(layer);

            // Export GeoJSON
            const geojson = layer.toGeoJSON();
            onGeofenceCreated(geojson);
        };

        map.on(L.Draw.Event.CREATED, onCreated);

        return () => {
            map.off(L.Draw.Event.CREATED, onCreated);
            if (drawControlRef.current) map.removeControl(drawControlRef.current);
        };
    }, [map, onGeofenceCreated]);

    return null;
}
