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
    "briefing": "Agente, se ha abierto un caso de maxima prioridad. Miguel de Cervantes, el mas grande escritor de la lengua espanola, ha sido asesinado en circunstancias misteriosas. Las autoridades de la epoca no pudieron resolver el caso, pero ahora contamos con una ventaja: las estatuas de Madrid guardan la memoria de lo ocurrido. Cuatro figuras historicas de la capital — un pintor real, un artista atormentado, un rey melancolico y un navegante fanfarron — conocen fragmentos de la verdad. Pero cuidado: no todos diran la verdad. Interroga a cada uno, reune las pistas y presenta tu veredicto. El destino de la justicia esta en tus manos.",
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


BARCELONA_MYSTERY_ID = "barcelona-liceu-001"

barcelona_mystery = {
    "id": BARCELONA_MYSTERY_ID,
    "title": "El Fantasma de la Opera del Liceu",
    "description": "Un misterioso fantasma acecha el Gran Teatre del Liceu. Las estatuas de Barcelona han visto algo aquella noche. Interroga a los testigos de piedra y descubre quien se esconde detras de la mascara.",
    "city": "Barcelona",
    "location": {"lat": Decimal("41.3810"), "lng": Decimal("2.1734")},
    "radius": 4000,
    "difficulty": "hard",
    "solution": "Antoni Gaudi",
    "active": True,
    "briefing": "Agente, un caso extraordinario ha llegado a nuestra agencia desde Barcelona. Alguien se ha disfrazado de fantasma y esta aterrorizando el Gran Teatre del Liceu, interrumpiendo los espectaculos y dejando notas amenazadoras escritas en catalan antiguo. La policia local esta desconcertada. Cuatro estatuas de la Ciudad Condal — un navegante, un filosofo, un pintor surrealista y un genio medieval — fueron testigos de los hechos. Sin embargo, uno de ellos oculta mas de lo que dice. Descubre la identidad del fantasma antes de que el Liceu cierre sus puertas para siempre.",
    "imageUrl": None,
    "createdAt": "2026-03-22T00:00:00Z",
}

barcelona_characters = [
    {
        "characterId": "colon-bcn-001",
        "mysteryId": BARCELONA_MYSTERY_ID,
        "name": "Cristobal Colon",
        "historicalPeriod": "Era de los Descubrimientos (1451-1506)",
        "description": "El gran navegante senala hacia el mar desde lo alto de su columna en el puerto de Barcelona, observando a todos los que llegan y se van.",
        "statue": {"lat": Decimal("41.3758"), "lng": Decimal("2.1779"), "name": "Monumento a Colon, Port Vell"},
        "clues": [
            "El fantasma siempre huye hacia la zona norte de la ciudad, hacia las montanas.",
            "He visto que lleva herramientas de arquitecto bajo la capa.",
            "El disfraz esta hecho con fragmentos de mosaico de ceramica rota.",
        ],
        "voice": "echo",
        "persona": "Eres Cristobal Colon, vigilante del puerto de Barcelona. Desde tu columna ves todo lo que ocurre en la ciudad. Hablas con autoridad marinera. Usas metaforas nauticas: 'como un barco en la niebla...', 'las corrientes del misterio...'. Eres directo y observador. Describes lo que has visto desde las alturas.",
    },
    {
        "characterId": "llull-001",
        "mysteryId": BARCELONA_MYSTERY_ID,
        "name": "Ramon Llull",
        "historicalPeriod": "Edad Media (1232-1316)",
        "description": "El filosofo y mistico mallorquin, sabio universal. Su estatua medita en silencio sobre los misterios del conocimiento humano.",
        "statue": {"lat": Decimal("41.3870"), "lng": Decimal("2.1700"), "name": "Monumento a Ramon Llull, Passeig de Lluis Companys"},
        "clues": [
            "El fantasma conoce los secretos de la geometria sagrada y las formas naturales.",
            "Escuche al fantasma hablar de trencadis, una tecnica de mosaico con azulejos rotos.",
            "El culpable esta obsesionado con la naturaleza y las formas organicas.",
        ],
        "voice": "fable",
        "persona": "Eres Ramon Llull, filosofo y mistico medieval. Hablas de forma enigmatica y poetica, mezclando logica con misticismo. Usas referencias a la geometria, los numeros y la naturaleza divina. Dices cosas como 'la verdad se esconde en las formas...', 'el conocimiento es un arbol con muchas ramas...'. Eres sabio pero críptico.",
    },
    {
        "characterId": "miro-001",
        "mysteryId": BARCELONA_MYSTERY_ID,
        "name": "Joan Miro",
        "historicalPeriod": "Arte Contemporaneo (1893-1983)",
        "description": "El genio surrealista barcelones, creador de mundos imaginarios. Su legado colorido ilumina la ciudad desde la Fundacio Miro en Montjuic.",
        "statue": {"lat": Decimal("41.3685"), "lng": Decimal("2.1527"), "name": "Fundacio Joan Miro, Montjuic"},
        "clues": [
            "PISTA FALSA: El fantasma es un cantante de opera italiano resentido.",
            "PISTA FALSA: Lo vi pintar las notas amenazadoras con colores primarios.",
            "Yo solo pinto suenos, detective. No se nada de fantasmas reales.",
        ],
        "voice": "alloy",
        "persona": "Eres Joan Miro, artista surrealista. Hablas de forma abstracta y juguetona, saltando entre ideas como en un sueno. Eres el distractor: das pistas falsas intencionadamente. Dices cosas como 'los colores me susurraron...', 'en mis suenos vi...'. Mezclas realidad y fantasia a proposito para confundir.",
    },
    {
        "characterId": "picasso-001",
        "mysteryId": BARCELONA_MYSTERY_ID,
        "name": "Pablo Picasso",
        "historicalPeriod": "Arte Moderno (1881-1973)",
        "description": "El genio malagueno que adopto Barcelona como su ciudad. Su museo en el Born guarda los secretos de su juventud artistica.",
        "statue": {"lat": Decimal("41.3854"), "lng": Decimal("2.1808"), "name": "Friso del Col·legi d'Arquitectes, Plaza Nova"},
        "clues": [
            "El fantasma dejo una maqueta de un edificio imposible junto a las notas.",
            "Reconoci el estilo: son las mismas curvas que ves en cierto parque famoso.",
            "El culpable queria que el Liceu se transformara en algo... mas organico.",
        ],
        "voice": "coral",
        "persona": "Eres Pablo Picasso, pintor genial con caracter fuerte. Hablas con pasion y algo de arrogancia artistica. Eres perspicaz y analitico: descompones la realidad en partes como un cuadro cubista. Dices cosas como 'mira desde otro angulo...', 'hay que romper las formas para ver la verdad...'. Eres directo cuando quieres serlo.",
    },
]


def seed():
    # Madrid mystery
    print(f"Seeding mystery: {mystery['title']}")
    mysteries_table.put_item(Item=mystery)
    print(f"  Mystery '{MYSTERY_ID}' created.")

    for char in characters:
        characters_table.put_item(Item=char)
        print(f"  Character '{char['name']}' created at {char['statue']['name']}")

    # Barcelona mystery
    print(f"\nSeeding mystery: {barcelona_mystery['title']}")
    mysteries_table.put_item(Item=barcelona_mystery)
    print(f"  Mystery '{BARCELONA_MYSTERY_ID}' created.")

    for char in barcelona_characters:
        characters_table.put_item(Item=char)
        print(f"  Character '{char['name']}' created at {char['statue']['name']}")

    print("\nDone! All mysteries and characters seeded successfully.")
    print(f"\nMadrid Solution: {mystery['solution']}")
    print(f"Barcelona Solution: {barcelona_mystery['solution']}")


if __name__ == "__main__":
    seed()
