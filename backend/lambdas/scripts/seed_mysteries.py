"""Seed script to populate DynamoDB with a sample mystery for Madrid.

Usage:
    AWS_PROFILE=your-profile python seed_mysteries.py

Requires the tables to be deployed first (via CDK).
"""

import boto3
import uuid
from decimal import Decimal

ENV = "dev"
REGION = "eu-west-1"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
mysteries_table = dynamodb.Table(f"{ENV}-cm-mysteries")
characters_table = dynamodb.Table(f"{ENV}-cm-characters")

MYSTERY_ID = "madrid-cervantes-001"

mystery = {
    "id": MYSTERY_ID,
    "title": "Quien asesino a Cervantes?",
    "description": "Alguien ha asesinado a Miguel de Cervantes y las estatuas de Madrid guardan el secreto. Habla con cada una de ellas para descubrir al culpable. Cada personaje conoce una parte de la verdad.",
    "city": "Madrid",
    "location": {"lat": Decimal("40.4168"), "lng": Decimal("-3.7038")},
    "radius": 3000,
    "difficulty": "medium",
    "solution": "Lope de Vega",
    "active": True,
    "imageUrl": None,
    "createdAt": "2026-03-20T00:00:00Z",
}

characters = [
    {
        "characterId": "velazquez-001",
        "mysteryId": MYSTERY_ID,
        "name": "Diego Velazquez",
        "historicalPeriod": "Siglo de Oro (1599-1660)",
        "description": "El pintor mas importante de la corte espanola. Su estatua se alza frente al Museo del Prado, paleta en mano, observando eternamente a los que pasan.",
        "statue": {"lat": Decimal("40.4145"), "lng": Decimal("-3.6946"), "name": "Estatua de Velazquez, Museo del Prado"},
        "clues": [
            "El arma del crimen fue una pluma envenenada, no una espada.",
            "El asesino era un escritor, no un noble ni un soldado.",
            "El veneno fue aplicado en la tinta, durante una supuesta colaboracion literaria.",
        ],
        "voice": "echo",
        "persona": "Eres Diego Velazquez, pintor de la corte. Hablas con elegancia y precision, como si describieras cada detalle de un cuadro. Eres observador y perceptivo. Usas metaforas visuales: 'como las sombras en un lienzo...', 'si observas con detenimiento...'. Eres algo arrogante pero justo.",
    },
    {
        "characterId": "goya-001",
        "mysteryId": MYSTERY_ID,
        "name": "Francisco de Goya",
        "historicalPeriod": "Ilustracion y Romanticismo (1746-1828)",
        "description": "El pintor de los horrores y las verdades oscuras de Espana. Su estatua vigila la entrada del Prado, con mirada tormentosa.",
        "statue": {"lat": Decimal("40.4141"), "lng": Decimal("-3.6927"), "name": "Estatua de Goya, Puerta del Prado"},
        "clues": [
            "El motivo del crimen fue la envidia literaria, no el dinero ni el poder.",
            "El asesino competia con Cervantes por la fama y el reconocimiento del publico.",
            "Cervantes habia humillado publicamente al asesino en un prologo satirico.",
        ],
        "voice": "fable",
        "persona": "Eres Francisco de Goya, testigo de las sombras de la humanidad. Hablas de forma oscura y directa, sin adornar la verdad. Usas imagenes macabras: 'los monstruos de la envidia devoran...', 'en la oscuridad del alma...'. Eres cinico pero sabio. Mencionas que 'el sueno de la razon produce monstruos'.",
    },
    {
        "characterId": "felipe-iv-001",
        "mysteryId": MYSTERY_ID,
        "name": "Felipe IV",
        "historicalPeriod": "Casa de Austria (1605-1665)",
        "description": "El Rey Planeta, mecenas de las artes y rey de un imperio en declive. Su estatua ecuestre domina la Plaza de Oriente frente al Palacio Real.",
        "statue": {"lat": Decimal("40.4180"), "lng": Decimal("-3.7138"), "name": "Estatua ecuestre de Felipe IV, Plaza de Oriente"},
        "clues": [
            "El crimen ocurrio en el barrio de las Letras, cerca de la casa del asesino.",
            "El asesino vivia a pocos metros de Cervantes, en la misma calle.",
            "La calle donde vivian ambos ahora lleva el nombre de Cervantes.",
        ],
        "voice": "alloy",
        "persona": "Eres Felipe IV, Rey de Espana. Hablas con majestuosidad y cierta melancolia por la grandeza perdida. Usas el 'nos' mayestatico ocasionalmente. Eres culto y te interesan las artes. Dices cosas como 'en nuestro reinado...', 'los asuntos de la corte...'. Eres generoso con la informacion si el detective muestra respeto.",
    },
    {
        "characterId": "colon-001",
        "mysteryId": MYSTERY_ID,
        "name": "Cristobal Colon",
        "historicalPeriod": "Era de los Descubrimientos (1451-1506)",
        "description": "El navegante que llego a America. Su imponente monumento en la Plaza de Colon senala hacia el oeste, hacia el Nuevo Mundo.",
        "statue": {"lat": Decimal("40.4256"), "lng": Decimal("-3.6901"), "name": "Monumento a Colon, Plaza de Colon"},
        "clues": [
            "PISTA FALSA: El asesino vino de las Americas en un galeon.",
            "PISTA FALSA: El crimen fue encargado por la corona portuguesa.",
            "Yo no se nada de este asunto, detective. Yo estaba navegando mares lejanos cuando ocurrio todo esto.",
        ],
        "voice": "coral",
        "persona": "Eres Cristobal Colon, navegante y explorador. Hablas de forma grandilocuente sobre tus viajes y descubrimientos. Intentas desviar la conversacion hacia tus hazanas. Eres un distractor: das pistas falsas a proposito. Dices cosas como 'cuando yo navegaba...', 'en el Nuevo Mundo...'. No sabes nada util sobre el crimen pero no lo admites facilmente.",
    },
]


def seed():
    print(f"Seeding mystery: {mystery['title']}")
    mysteries_table.put_item(Item=mystery)
    print(f"  Mystery '{MYSTERY_ID}' created.")

    for char in characters:
        characters_table.put_item(Item=char)
        print(f"  Character '{char['name']}' created at {char['statue']['name']}")

    print("\nDone! Mystery and characters seeded successfully.")
    print(f"\nSolution: {mystery['solution']}")
    print("\nCharacters:")
    for c in characters:
        print(f"  - {c['name']} ({c['statue']['name']})")


if __name__ == "__main__":
    seed()
