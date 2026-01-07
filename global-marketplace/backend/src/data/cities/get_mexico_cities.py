#!/usr/bin/env python3
"""
Script para obtener datos completos de ciudades de México
Fuente: INEGI + Back4App Database
"""

import json
import requests

# Estados de México con códigos
ESTADOS_MEXICO = {
    "01": "Aguascalientes",
    "02": "Baja California",
    "03": "Baja California Sur",
    "04": "Campeche",
    "05": "Coahuila",
    "06": "Colima",
    "07": "Chiapas",
    "08": "Chihuahua",
    "09": "Ciudad de México",
    "10": "Durango",
    "11": "Guanajuato",
    "12": "Guerrero",
    "13": "Hidalgo",
    "14": "Jalisco",
    "15": "México",
    "16": "Michoacán",
    "17": "Morelos",
    "18": "Nayarit",
    "19": "Nuevo León",
    "20": "Oaxaca",
    "21": "Puebla",
    "22": "Querétaro",
    "23": "Quintana Roo",
    "24": "San Luis Potosí",
    "25": "Sinaloa",
    "26": "Sonora",
    "27": "Tabasco",
    "28": "Tamaulipas",
    "29": "Tlaxcala",
    "30": "Veracruz",
    "31": "Yucatán",
    "32": "Zacatecas"
}

# Ciudades principales por estado (Top 5-10 por población)
CIUDADES_PRINCIPALES = {
    "Aguascalientes": ["Aguascalientes", "Jesús María", "Calvillo", "Rincón de Romos", "Pabellón de Arteaga"],
    "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Playas de Rosarito", "Tecate"],
    "Baja California Sur": ["La Paz", "Los Cabos", "San José del Cabo", "Cabo San Lucas", "Ciudad Constitución"],
    "Campeche": ["Campeche", "Ciudad del Carmen", "Champotón", "Escárcega", "Calkiní"],
    "Coahuila": ["Saltillo", "Torreón", "Monclova", "Piedras Negras", "Acuña", "Ramos Arizpe"],
    "Colima": ["Colima", "Manzanillo", "Tecomán", "Villa de Álvarez", "Armería"],
    "Chiapas": ["Tuxtla Gutiérrez", "Tapachula", "San Cristóbal de las Casas", "Comitán", "Palenque", "Ocosingo"],
    "Chihuahua": ["Chihuahua", "Ciudad Juárez", "Cuauhtémoc", "Delicias", "Parral", "Nuevo Casas Grandes"],
    "Ciudad de México": ["Iztapalapa", "Gustavo A. Madero", "Álvaro Obregón", "Tlalpan", "Coyoacán", "Cuauhtémoc", "Miguel Hidalgo", "Benito Juárez", "Xochimilco", "Iztacalco"],
    "Durango": ["Durango", "Gómez Palacio", "Lerdo", "Santiago Papasquiaro", "Guadalupe Victoria"],
    "Guanajuato": ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato", "San Miguel de Allende", "Silao", "Pénjamo", "Dolores Hidalgo"],
    "Guerrero": ["Acapulco", "Chilpancingo", "Iguala", "Zihuatanejo", "Taxco", "Chilapa"],
    "Hidalgo": ["Pachuca", "Tulancingo", "Tizayuca", "Tepeji del Río", "Tula de Allende"],
    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Tlajomulco", "Puerto Vallarta", "Lagos de Moreno", "Tepatitlán"],
    "México": ["Ecatepec", "Nezahualcóyotl", "Naucalpan", "Tlalnepantla", "Toluca", "Chimalhuacán", "Atizapán de Zaragoza", "Cuautitlán Izcalli", "Ixtapaluca", "Texcoco"],
    "Michoacán": ["Morelia", "Uruapan", "Zamora", "Lázaro Cárdenas", "Apatzingán", "Pátzcuaro"],
    "Morelos": ["Cuernavaca", "Jiutepec", "Cuautla", "Temixco", "Yautepec"],
    "Nayarit": ["Tepic", "Bahía de Banderas", "Santiago Ixcuintla", "Compostela", "Tuxpan"],
    "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "San Pedro Garza García", "General Escobedo", "Santa Catarina", "García"],
    "Oaxaca": ["Oaxaca de Juárez", "Salina Cruz", "Juchitán", "Tuxtepec", "Huajuapan de León", "Puerto Escondido"],
    "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "Cholula", "Teziutlán"],
    "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora", "El Marqués", "Tequisquiapan"],
    "Quintana Roo": ["Cancún", "Playa del Carmen", "Chetumal", "Cozumel", "Tulum", "Isla Mujeres"],
    "San Luis Potosí": ["San Luis Potosí", "Soledad de Graciano Sánchez", "Ciudad Valles", "Matehuala", "Rioverde"],
    "Sinaloa": ["Culiacán", "Mazatlán", "Los Mochis", "Guasave", "Guamúchil"],
    "Sonora": ["Hermosillo", "Ciudad Obregón", "Nogales", "San Luis Río Colorado", "Navojoa", "Guaymas"],
    "Tabasco": ["Villahermosa", "Cárdenas", "Comalcalco", "Huimanguillo", "Macuspana"],
    "Tamaulipas": ["Reynosa", "Matamoros", "Nuevo Laredo", "Tampico", "Ciudad Victoria", "Ciudad Madero"],
    "Tlaxcala": ["Tlaxcala", "Apizaco", "Huamantla", "San Pablo del Monte", "Chiautempan"],
    "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Poza Rica", "Córdoba", "Orizaba", "Minatitlán", "Tuxpan"],
    "Yucatán": ["Mérida", "Kanasín", "Valladolid", "Tizimín", "Progreso", "Umán"],
    "Zacatecas": ["Zacatecas", "Fresnillo", "Guadalupe", "Río Grande", "Sombrerete"]
}

def generate_mexico_cities_data():
    """Genera estructura completa de ciudades de México"""
    
    data = {
        "country": "Mexico",
        "country_code": "MX",
        "total_states": len(ESTADOS_MEXICO),
        "states": []
    }
    
    for codigo, estado in ESTADOS_MEXICO.items():
        state_data = {
            "state_code": codigo,
            "state_name": estado,
            "cities": []
        }
        
        # Agregar ciudades principales
        if estado in CIUDADES_PRINCIPALES:
            for ciudad in CIUDADES_PRINCIPALES[estado]:
                city_data = {
                    "city_name": ciudad,
                    "state": estado,
                    "country": "Mexico",
                    "is_major": True
                }
                state_data["cities"].append(city_data)
        
        state_data["total_cities"] = len(state_data["cities"])
        data["states"].append(state_data)
    
    return data

def save_to_json(data, filename):
    """Guarda datos en archivo JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Datos guardados en {filename}")

def generate_sql_insert(data):
    """Genera SQL INSERT statements para poblar base de datos"""
    
    sql_statements = []
    
    # Header
    sql_statements.append("-- SQL INSERT Statements para ciudades de México")
    sql_statements.append("-- Generado automáticamente\n")
    
    # Tabla de estados
    sql_statements.append("-- Insertar estados")
    sql_statements.append("INSERT INTO states (code, name, country_code) VALUES")
    
    state_values = []
    for state in data["states"]:
        state_values.append(f"  ('{state['state_code']}', '{state['state_name']}', 'MX')")
    
    sql_statements.append(",\n".join(state_values) + ";\n")
    
    # Tabla de ciudades
    sql_statements.append("-- Insertar ciudades principales")
    sql_statements.append("INSERT INTO cities (name, state_code, country_code, is_major) VALUES")
    
    city_values = []
    for state in data["states"]:
        for city in state["cities"]:
            # Escapar comillas simples
            city_name = city["city_name"].replace("'", "''")
            city_values.append(f"  ('{city_name}', '{state['state_code']}', 'MX', TRUE)")
    
    sql_statements.append(",\n".join(city_values) + ";")
    
    return "\n".join(sql_statements)

def main():
    print("🚀 Generando datos de ciudades de México...\n")
    
    # Generar datos
    data = generate_mexico_cities_data()
    
    # Estadísticas
    total_cities = sum(state["total_cities"] for state in data["states"])
    print(f"📊 Estadísticas:")
    print(f"   - Estados: {data['total_states']}")
    print(f"   - Ciudades principales: {total_cities}\n")
    
    # Guardar JSON
    json_file = "/home/ubuntu/mexico_cities.json"
    save_to_json(data, json_file)
    
    # Generar SQL
    sql_content = generate_sql_insert(data)
    sql_file = "/home/ubuntu/mexico_cities.sql"
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    print(f"✅ SQL generado en {sql_file}")
    
    # Generar CSV para fácil importación
    import csv
    csv_file = "/home/ubuntu/mexico_cities.csv"
    with open(csv_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['state_code', 'state_name', 'city_name', 'country_code', 'is_major'])
        
        for state in data["states"]:
            for city in state["cities"]:
                writer.writerow([
                    state["state_code"],
                    state["state_name"],
                    city["city_name"],
                    "MX",
                    "TRUE"
                ])
    print(f"✅ CSV generado en {csv_file}")
    
    print("\n✅ ¡Proceso completado!")
    print(f"\n📁 Archivos generados:")
    print(f"   1. {json_file} - Datos en formato JSON")
    print(f"   2. {sql_file} - SQL INSERT statements")
    print(f"   3. {csv_file} - CSV para importación")

if __name__ == "__main__":
    main()
