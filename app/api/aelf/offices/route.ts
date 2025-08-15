import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const officeParam = searchParams.get("office") || "laudes"
  const office = officeParam.toLowerCase().replace('-', '_')

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
  }

  let html: string | null = null

  try {
    console.log(`Récupération de l'office ${office} pour ${date}`)

    // Endpoints possibles pour les offices AELF
    const endpoints = [
      `https://api.aelf.org/v1/offices/${office}/${date}`,
      `https://api.aelf.org/v1/heures/${office}/${date}`,
      `https://www.aelf.org/api/v1/offices/${office}/${date}`,
    ]

    // Tentative API JSON
    for (const endpoint of endpoints) {
      try {
        console.log(`Tentative office avec: ${endpoint}`)
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "LuxLectio/1.0",
          },
          signal: AbortSignal.timeout?.(10000),
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`Succès office avec: ${endpoint}`)
          return NextResponse.json(data, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
              "Pragma": "no-cache",
              "Expires": "0",
            },
          })
        }
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
  }
}
