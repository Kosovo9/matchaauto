-- Datos Mock para validación de la Trinidad
INSERT INTO listings (
        id,
        domain,
        title,
        description,
        price,
        city,
        state,
        lat,
        lng,
        attrs
    )
VALUES (
        'auto-1',
        'auto',
        'Tesla Model 3 Performance',
        'Full self-driving, 2023, grey.',
        45000,
        'Mexico City',
        'CDMX',
        19.4326,
        -99.1332,
        '{"verified": true, "acceleration": "3.1s"}'
    ),
    (
        'auto-2',
        'auto',
        'Audi e-tron GT',
        '2024 limited edition, electric luxury.',
        110000,
        'Monterrey',
        'NL',
        25.6866,
        -100.3161,
        '{"verified": true}'
    ),
    (
        'market-1',
        'marketplace',
        'MacBook Pro M3 Max',
        '16-inch, 64GB RAM, 2TB SSD.',
        3500,
        'Guadalajara',
        'JAL',
        20.6597,
        -103.3496,
        '{"condition": "New", "badge": "Hot"}'
    ),
    (
        'market-2',
        'marketplace',
        'Sony A7R V',
        'Mirrorless camera, 61MP.',
        3200,
        'Queretaro',
        'QRO',
        20.5888,
        -100.3899,
        '{"badge": "Verified"}'
    ),
    (
        'asset-1',
        'assets',
        'Penthouse in Santa Fe',
        'Amazing skyline view, 3 bedrooms.',
        1250000,
        'Santa Fe',
        'CDMX',
        19.3622,
        -99.2599,
        '{"type": "Penthouse", "area": "350sqm"}'
    ),
    (
        'asset-2',
        'assets',
        'Beach Front Villa',
        'Private beach access, pool, 5 suites.',
        2800000,
        'Tulum',
        'QR',
        20.2114,
        -87.4654,
        '{"type": "Villa", "view": "Ocean"}'
    ) ON CONFLICT (id) DO NOTHING;