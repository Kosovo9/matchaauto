#!/usr/bin/env python3
import json
import csv
import os

# Diccionario de países y sus ciudades principales (Top 5-10 por país)
# En un escenario real, esto se alimentaría de una base de datos masiva como GeoNames
GLOBAL_CITIES = {
    "USA": {
        "code": "US",
        "states": {
            "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento"],
            "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
            "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth"],
            "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "Tallahassee"]
        }
    },
    "Canada": {
        "code": "CA",
        "states": {
            "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton"],
            "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"],
            "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond"]
        }
    },
    "Brazil": {
        "code": "BR",
        "states": {
            "São Paulo": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André"],
            "Rio de Janeiro": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói"],
            "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"]
        }
    },
    "Spain": {
        "code": "ES",
        "states": {
            "Madrid": ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés"],
            "Catalonia": ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell"],
            "Andalusia": ["Seville", "Málaga", "Córdoba", "Granada", "Jerez de la Frontera"]
        }
    },
    "Germany": {
        "code": "DE",
        "states": {
            "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt"],
            "Berlin": ["Berlin"],
            "Hamburg": ["Hamburg"]
        }
    },
    "Japan": {
        "code": "JP",
        "states": {
            "Tokyo": ["Tokyo", "Hachioji", "Machida", "Fuchu", "Chofu"],
            "Osaka": ["Osaka", "Sakai", "Higashiosaka", "Hirakata", "Toyonaka"]
        }
    }
}

# Incluir México (ya generado previamente, pero lo agregamos para el ZIP global)
MEXICO_DATA = {
    "Mexico": {
        "code": "MX",
        "states": {
            "Ciudad de México": ["Iztapalapa", "Gustavo A. Madero", "Álvaro Obregón", "Tlalpan", "Coyoacán"],
            "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco"],
            "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "San Pedro Garza García"],
            "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Playas de Rosarito", "Tecate"]
        }
    }
}

GLOBAL_CITIES.update(MEXICO_DATA)

def generate_files():
    output_dir = "/home/ubuntu/global_cities_db"
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Generar JSON Maestro
    with open(f"{output_dir}/global_cities.json", 'w', encoding='utf-8') as f:
        json.dump(GLOBAL_CITIES, f, ensure_ascii=False, indent=2)
    
    # 2. Generar CSV para importación masiva
    with open(f"{output_dir}/global_cities.csv", 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['country', 'country_code', 'state', 'city', 'is_major'])
        
        for country, info in GLOBAL_CITIES.items():
            for state, cities in info['states'].items():
                for city in cities:
                    writer.writerow([country, info['code'], state, city, 'TRUE'])
    
    # 3. Generar SQL para PostgreSQL (Supabase)
    with open(f"{output_dir}/global_cities.sql", 'w', encoding='utf-8') as f:
        f.write("-- Base de Datos Global de Ciudades para Match-Auto\n")
        f.write("INSERT INTO locations (country, country_code, state, city, is_major) VALUES\n")
        
        values = []
        for country, info in GLOBAL_CITIES.items():
            for state, cities in info['states'].items():
                for city in cities:
                    # Escapar comillas
                    c_name = country.replace("'", "''")
                    s_name = state.replace("'", "''")
                    ct_name = city.replace("'", "''")
                    values.append(f"  ('{c_name}', '{info['code']}', '{s_name}', '{ct_name}', TRUE)")
        
        f.write(",\n".join(values) + ";")

    print(f"✅ Archivos generados en {output_dir}")

if __name__ == "__main__":
    generate_files()
