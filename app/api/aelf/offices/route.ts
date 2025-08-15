import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
<<<<<<< HEAD
  const officeParam = searchParams.get("office") || "laudes"
  const office = officeParam.toLowerCase().replace('-', '_')
=======
  const office = searchParams.get("office") || "laudes"
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

<<<<<<< HEAD
  let html: string | null = null

  try {
    console.log(`Récupération de l'office ${office} pour ${date}`)

    // Endpoints possibles pour les offices AELF
=======
  try {
    console.log(`Récupération de l'office ${office} pour ${date}`)

    // Endpoints possibles pour les offices (AELF uniquement, pas de fallback)
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
    const endpoints = [
      `https://api.aelf.org/v1/offices/${office}/${date}`,
      `https://api.aelf.org/v1/heures/${office}/${date}`,
      `https://www.aelf.org/api/v1/offices/${office}/${date}`,
    ]

<<<<<<< HEAD
    // Tentative API JSON
    for (const endpoint of endpoints) {
      try {
        console.log(`Tentative office avec: ${endpoint}`)
=======
    for (const endpoint of endpoints) {
      try {
        console.log(`Tentative office avec: ${endpoint}`)

>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "LuxLectio/1.0",
          },
<<<<<<< HEAD
          signal: AbortSignal.timeout?.(10000),
=======
          signal: AbortSignal.timeout(10000),
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`Succès office avec: ${endpoint}`)
<<<<<<< HEAD
=======

>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
          return NextResponse.json(data, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          })
        }
<<<<<<< HEAD
      } catch (err) {
        console.warn(`Erreur office avec ${endpoint}:`, err)
      }
    }

    // Scraping AELF
    try {
      const officeUrl = `https://www.aelf.org/${date}/romain/${office}`
      const response = await fetch(officeUrl, {
        headers: { "User-Agent": "LuxLectio/1.0", Accept: "text/html" },
        signal: AbortSignal.timeout?.(10000),
      })
      if (response.ok) {
        html = await response.text()
        const divMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                         html.match(/<div[^>]*class=["'][^"']*container-reading[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                         html.match(/<div[^>]*class=["'][^"']*block-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
        if (divMatch) html = divMatch[1]
      }
    } catch (err) {
      console.warn("Erreur scraping AELF:", err)
    }

    // Scraping iBreviary si AELF échoue
    if (!html) {
      try {
        const dateStr = date.replace(/-/g, "")
        const ibreviaryUrl = `https://www.ibreviary.com/m2/breviario.php?lang=fr&giorno=${dateStr}&orazione=${office}`
        const response = await fetch(ibreviaryUrl, {
          headers: { "User-Agent": "LuxLectio/1.0", Accept: "text/html" },
          signal: AbortSignal.timeout?.(10000),
        })
        if (response.ok) {
          html = await response.text()
          const divMatch = html.match(/<div[^>]*id=["']content["'][^>]*>([\s\S]*?)<\/div>/i)
          if (divMatch) html = divMatch[1]
        }
      } catch (err) {
        console.warn("Erreur scraping iBreviary:", err)
      }
    }

    // Nettoyage HTML si on a réussi un scraping
    if (html && html.length > 100) {
      let cleanHtml = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/\s?class="(?![^"]*(?:titre|texte|antienne|psaume|lecture|cantique|priere|office|response|verset))[^"]*"/gi, "")
        .replace(/\s?id="[^"]*"/gi, "")
        .replace(/\s?data-[^=]+="[^"]*"/gi, "")
        .replace(/<a [^>]*href="([^"]*?)"[^>]*>([\s\S]*?)<\/a>/gi, '<a href="$1">$2</a>')
        .replace(/<img[^>]*alt="([^"]*?)"[^>]*>/gi, '<img alt="$1">')
        .replace(/<img[^>]*>/gi, "")
      return NextResponse.json({
        date,
        office,
        html: cleanHtml,
        source: html.includes("aelf.org") ? "aelf.org-scraper" : "ibreviary.com-scraper",
        note: "Office récupéré par scraping HTML. Structure brute, non normalisée.",
      }, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      })
    }

    // Fallback local
    console.log(`Utilisation du fallback pour l'office ${office}`)
    const fallbackData = generateFallbackOfficeData(office, date)
    return NextResponse.json(fallbackData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })

  } catch (error) {
    console.error("Erreur générale office:", error)
    return NextResponse.json({
      error: "Erreur lors de la récupération de l'office",
      details: error instanceof Error ? error.message : "Erreur inconnue",
    }, { status: 500 })
  }
}

// Fonction fallback inchangée
function generateFallbackOfficeData(office: string, date: string) {
  // Ici tu peux réutiliser exactement ton code actuel
  // avec les offices : laudes, tierce, sexte, vepres, complies, office_lectures, default
  // et générer le HTML correspondant
  return {
    date,
    office,
    html: `<p>Fallback pour ${office} le ${date}</p>`,
    source: "fallback",
    note: "Données générées localement",
=======
      } catch (error) {
        console.log(`Erreur office avec ${endpoint}:`, error)
      }
    }

    // Si aucun endpoint ne répond, tente de scraper le site officiel AELF
    try {
      const officeUrl = `https://www.aelf.org/${date}/romain/${office}`
      const htmlResponse = await fetch(officeUrl, {
        headers: {
          "User-Agent": "LuxLectio/1.0",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(10000),
      })
      if (htmlResponse.ok) {
        const html = await htmlResponse.text()
        // Extraction du bloc <div class="container-reading"> (nouvelle structure AELF)
        const divMatch = html.match(/<div[^>]*class=["'][^"']*container-reading[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)
        if (divMatch) {
          const mainHtml = divMatch[1]
          // Nettoyage basique : suppression des balises script/style et des attributs
          let cleanHtml = mainHtml
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/\s?class="[^"]*"/gi, "")
            .replace(/\s?id="[^"]*"/gi, "")
            .replace(/\s?data-[^=]+="[^"]*"/gi, "")
            .replace(/<a [^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, "$1")
            .replace(/<img[^>]*>/gi, "")
          // On retourne le HTML nettoyé dans une propriété "html"
          return NextResponse.json({
            date,
            office,
            html: cleanHtml,
            source: "aelf.org-scraper",
            note: "Office récupéré par scraping HTML du site officiel AELF. Structure brute, non normalisée.",
          }, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          })
        }
      }
    } catch (scrapeError) {
      console.error("Erreur scraping AELF:", scrapeError)
    }
    // Si le scraping échoue aussi, tente iBreviary (scraping HTML)
    try {
      // iBreviary propose les offices en HTML, mais l'URL dépend de la langue et du jour liturgique
      // On tente le lien direct pour laudes en français
      // Format attendu : https://www.ibreviary.com/m2/breviario.php?lang=fr&giorno=YYYYMMDD&orazione=laudes
      const dateStr = date.replace(/-/g, "")
      const ibreviaryUrl = `https://www.ibreviary.com/m2/breviario.php?lang=fr&giorno=${dateStr}&orazione=${office}`
      const ibreviaryResponse = await fetch(ibreviaryUrl, {
        headers: {
          "User-Agent": "LuxLectio/1.0",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(10000),
      })
      if (ibreviaryResponse.ok) {
        const html = await ibreviaryResponse.text()
        // Extraction du bloc principal : <div id="content">
        const divMatch = html.match(/<div[^>]*id=["']content["'][^>]*>([\s\S]*?)<\/div>/i)
        if (divMatch) {
          let cleanHtml = divMatch[1]
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/\s?class="[^"]*"/gi, "")
            .replace(/\s?id="[^"]*"/gi, "")
            .replace(/\s?data-[^=]+="[^"]*"/gi, "")
            .replace(/<a [^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi, "$1")
            .replace(/<img[^>]*>/gi, "")
          return NextResponse.json({
            date,
            office,
            html: cleanHtml,
            source: "ibreviary.com-scraper",
            note: "Office récupéré par scraping HTML du site iBreviary. Structure brute, non normalisée.",
          }, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          })
        }
      }
    } catch (ibreviaryError) {
      console.error("Erreur scraping iBreviary:", ibreviaryError)
    }
    // Si tout échoue, retourne une erreur explicite
    return NextResponse.json(
      {
        error: "Impossible de récupérer l'office depuis l'API AELF, le site AELF, ni iBreviary.",
        details: `Aucune donnée disponible pour l'office ${office} à la date ${date}`,
      },
      { status: 503 },
    )
  } catch (error) {
    console.error("Erreur générale office:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'office",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}

function generateFallbackOfficeData(office: string, date: string) {
  const officeData = {
    laudes: {
      nom: "Laudes",
      antienne: "Que tout ce qui respire loue le Seigneur !",
      psaumes: [
        {
          numero: "Ps 62",
          titre: "L'âme qui cherche Dieu",
          antienne: "Dieu, tu es mon Dieu, je te cherche dès l'aube.",
          texte:
            "Dieu, tu es mon Dieu, je te cherche dès l'aube : mon âme a soif de toi ; après toi languit ma chair, terre aride, altérée, sans eau.",
        },
      ],
      cantique: {
        reference: "Cantique de Zacharie (Lc 1, 68-79)",
        antienne: "Béni soit le Seigneur, le Dieu d'Israël, qui visite et rachète son peuple.",
        texte:
          "Béni soit le Seigneur, le Dieu d'Israël, qui visite et rachète son peuple, et nous donne un sauveur puissant dans la maison de David, son serviteur.",
      },
      priere:
        "Dieu qui fais briller sur nous la lumière de ce jour nouveau, accorde-nous de ne commettre aucun péché aujourd'hui et de marcher toujours dans tes voies. Par Jésus, le Christ, notre Seigneur. Amen.",
    },
    vepres: {
      nom: "Vêpres",
      antienne: "Que ma prière devant toi s'élève comme un encens.",
      psaumes: [
        {
          numero: "Ps 140",
          titre: "Prière dans l'épreuve",
          antienne: "Que ma prière monte devant toi comme l'encens.",
          texte:
            "Seigneur, je t'appelle : accours vers moi ! Entends ma voix qui t'appelle ! Que ma prière devant toi s'élève comme un encens, et mes mains, comme l'offrande du soir.",
        },
      ],
      cantique: {
        reference: "Cantique de Marie (Lc 1, 46-55)",
        antienne: "Mon âme exalte le Seigneur, exulte mon esprit en Dieu, mon Sauveur !",
        texte:
          "Mon âme exalte le Seigneur, exulte mon esprit en Dieu, mon Sauveur ! Il s'est penché sur son humble servante ; désormais tous les âges me diront bienheureuse.",
      },
      priere:
        "Dieu qui nous as donné de parvenir au soir de ce jour, garde-nous sans péché durant cette nuit, et fais que nous puissions te louer au matin. Par Jésus, le Christ, notre Seigneur. Amen.",
    },
  }

  return {
    date,
    office,
    data: officeData[office as keyof typeof officeData] || officeData.laudes,
    source: "fallback",
    note: "Données de l'office en cours de récupération depuis l'API AELF. Contenu liturgique authentique en attente.",
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
  }
}
