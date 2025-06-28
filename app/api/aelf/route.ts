import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const zone = searchParams.get("zone") || "france"

  try {
    console.log(`Récupération des lectures AELF pour ${date}`)

    // Endpoint principal AELF
    const endpoint = `https://api.aelf.org/v1/messes/${date}/${zone}`

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "LuxLectio/1.0 (Application liturgique)",
        Referer: "https://www.aelf.org/",
      },
      next: { revalidate: 3600 }, // Cache d'une heure
    })

    if (!response.ok) {
      throw new Error(`Erreur API AELF: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Normalisation des données pour notre application
    const normalizedData = {
      informations: {
        date,
        jour_liturgique_nom: data.informations?.jour_liturgique_nom || "Jour liturgique",
        couleur: data.informations?.couleur || "vert",
        temps_liturgique: data.informations?.temps_liturgique || "ordinaire",
        semaine: data.informations?.semaine || "",
      },
      messes: data.messes || [],
      lectures: {},
    }

    // Extraction des lectures pour faciliter l'accès
    if (normalizedData.messes[0]?.lectures) {
      normalizedData.messes[0].lectures.forEach((lecture: any) => {
        if (lecture.type) {
          normalizedData.lectures[lecture.type] = lecture
        }
      })
    }

    return NextResponse.json(normalizedData, {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des lectures:", error)

    // En cas d'erreur, essayer un endpoint alternatif
    try {
      const alternativeEndpoint = `https://www.aelf.org/api/v1/messes/${date}`

      const alternativeResponse = await fetch(alternativeEndpoint, {
        headers: {
          Accept: "application/json",
          "User-Agent": "LuxLectio/1.0",
        },
      })

      if (alternativeResponse.ok) {
        const alternativeData = await alternativeResponse.json()

        // Normalisation des données alternatives
        const normalizedData = {
          informations: {
            date,
            jour_liturgique_nom: alternativeData.nom || "Jour liturgique",
            couleur: alternativeData.couleur || "vert",
            temps_liturgique: alternativeData.temps_liturgique || "ordinaire",
          },
          messes: alternativeData.messes || [],
          lectures: {},
        }

        // Extraction des lectures
        if (normalizedData.messes[0]?.lectures) {
          normalizedData.messes[0].lectures.forEach((lecture: any) => {
            if (lecture.type) {
              normalizedData.lectures[lecture.type] = lecture
            }
          })
        }

        return NextResponse.json(normalizedData)
      }
    } catch (alternativeError) {
      console.error("Erreur avec l'endpoint alternatif:", alternativeError)
    }

    // Fallback avec données générées selon la date
    const fallbackData = generateFallbackData(date)
    return NextResponse.json(fallbackData, {
      headers: {
        "X-Data-Source": "fallback",
      },
    })
  }
}

function generateFallbackData(date: string) {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.getDay()
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()

  // Déterminer la couleur liturgique selon la période
  let couleur = "vert"
  let tempsLiturgique = "ordinaire"
  let jourLiturgique = "Temps ordinaire"

  // Avent (approximatif)
  if (month === 12 && day <= 24) {
    couleur = "violet"
    tempsLiturgique = "avent"
    jourLiturgique = "Temps de l'Avent"
  }
  // Noël
  else if (month === 12 && day >= 25) {
    couleur = "blanc"
    tempsLiturgique = "noel"
    jourLiturgique = "Temps de Noël"
  }
  // Carême (approximatif)
  else if (month >= 2 && month <= 4) {
    couleur = "violet"
    tempsLiturgique = "careme"
    jourLiturgique = "Temps du Carême"
  }
  // Pâques (approximatif)
  else if (month >= 4 && month <= 6) {
    couleur = "blanc"
    tempsLiturgique = "paques"
    jourLiturgique = "Temps pascal"
  }

  const dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
  const dayName = dayNames[dayOfWeek]

  return {
    informations: {
      date,
      jour_liturgique_nom: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} du ${jourLiturgique}`,
      couleur,
      temps_liturgique: tempsLiturgique,
    },
    messes: [
      {
        nom: `Messe du ${dayName}`,
        lectures: [
          {
            type: "lecture_1",
            titre: "Première lecture",
            reference: "Lecture de l'Écriture Sainte",
            contenu: `<p>Parole du Seigneur pour ce ${dayName}. Les lectures liturgiques nous nourrissent de la Parole de Dieu chaque jour.</p><p>Cette lecture nous invite à la méditation et à la prière, nous rappelant l'amour infini de Dieu pour chacun de nous.</p>`,
          },
          {
            type: "psaume",
            titre: "Psaume responsorial",
            reference: "Ps 23",
            refrain_psalmique: "Le Seigneur est mon berger, je ne manque de rien.",
            contenu: `<p>Le Seigneur est mon berger : je ne manque de rien.<br/>Sur des prés d'herbe fraîche, il me fait reposer.</p><p>Il me mène vers les eaux tranquilles et me fait revivre ; il me conduit par le juste chemin pour l'honneur de son nom.</p>`,
          },
          {
            type: "evangile",
            titre: "Évangile de Jésus Christ",
            reference: "Évangile selon saint Matthieu",
            verset_evangile: "Alléluia. Alléluia. Ta parole, Seigneur, est vérité, et ta loi, délivrance. Alléluia.",
            contenu: `<p>En ce temps-là, Jésus disait à ses disciples : « Venez à moi, vous tous qui peinez sous le poids du fardeau, et moi, je vous procurerai le repos. »</p><p>« Prenez sur vous mon joug, devenez mes disciples, car je suis doux et humble de cœur, et vous trouverez le repos pour votre âme. Oui, mon joug est facile à porter, et mon fardeau, léger. »</p>`,
          },
        ],
      },
    ],
    lectures: {},
    source: "fallback",
    note: `Données temporaires pour ${date}. Connexion à l'API AELF en cours...`,
  }
}