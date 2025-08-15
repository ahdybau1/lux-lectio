"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, RefreshCw, Share2, Heart, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLiturgical } from "@/components/liturgical-provider"
import { CalendarWidget } from "@/components/calendar-widget"
import { ReadingCard } from "@/components/reading-card"

export default function HomePage() {
  const { currentDate, liturgicalData, loading, error, setCurrentDate, refreshData } = useLiturgical()
  const [favorites, setFavorites] = useState<string[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
<<<<<<< HEAD
  const [selectedMassIndex, setSelectedMassIndex] = useState(0)
=======
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatLiturgicalDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const toggleFavorite = () => {
    const dateStr = formatDate(currentDate)
    const newFavorites = favorites.includes(dateStr) ? favorites.filter((d) => d !== dateStr) : [...favorites, dateStr]

    setFavorites(newFavorites)
    localStorage.setItem("lux-lectio-favorites", JSON.stringify(newFavorites))
  }

  const shareReading = async () => {
    if (navigator.share && liturgicalData) {
      try {
        await navigator.share({
          title: `Lux Lectio - ${liturgicalData.messes?.[0]?.nom || "Lectures du jour"}`,
          text: `Lectures du ${formatLiturgicalDate(currentDate)}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Partage annulé")
      }
    }
  }

  // Vérifier si la date est dans les favoris
  const isFavorite = favorites.includes(formatDate(currentDate))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-liturgical-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des lectures du jour...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="max-w-md liturgical-card">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Impossible de récupérer les données depuis l'API AELF. Vérifiez votre connexion internet.
            </p>
            <Button onClick={refreshData} variant="outline" className="hover-lift">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

<<<<<<< HEAD
  // Récupérer les lectures depuis la structure AELF
  let readings: any[] = []
  
  // Vérifier s'il y a plusieurs messes disponibles
  const hasManyMasses = liturgicalData?.messes && liturgicalData.messes.length > 1
  
  // Utiliser directement les lectures de la messe sélectionnée
  if (liturgicalData?.messes?.[selectedMassIndex]?.lectures) {
    readings = liturgicalData.messes[selectedMassIndex].lectures
  } else if (liturgicalData?.lectures && Object.keys(liturgicalData.lectures).length > 0) {
    // Fallback: utiliser l'objet lectures indexé par type si disponible
=======
  // Récupérer les lectures depuis la structure AELF (priorité à l'objet lectures indexé par type)
  let readings: any[] = []
  if (liturgicalData?.lectures && Object.keys(liturgicalData.lectures).length > 0) {
    // On récupère les lectures dans l'ordre classique
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
    const order = ["lecture_1", "psaume", "lecture_2", "evangile"]
    readings = order
      .map((key) => liturgicalData.lectures[key])
      .filter((r) => !!r)
<<<<<<< HEAD
=======
  } else if (liturgicalData?.messes?.[0]?.lectures) {
    readings = liturgicalData.messes[0].lectures
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header fixe avec calendrier */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-liturgical-primary/10 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-4 py-2 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4 animate-slide-in-left">
            <Button variant="outline" size="sm" onClick={() => navigateDate("prev")} className="hover-lift">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-liturgical-primary">
                {formatLiturgicalDate(currentDate)}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Button variant="ghost" size="sm" onClick={goToToday} className="hover-glow">
                  Aujourd'hui
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigateDate("next")} className="hover-lift">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 animate-slide-in-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`hover-glow ${isFavorite ? "text-red-500" : ""}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={shareReading} className="hover-glow">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={refreshData} className="hover-glow">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Calendrier supprimé de la page d'accueil, il reste accessible via la sidebar */}
      </header>

      <div className="grid grid-cols-1">
        {/* Contenu principal */}
        <div>
          {liturgicalData && (
            <div className="space-y-6">
              {/* Informations liturgiques */}
              <Card className="liturgical-card hover-lift animate-scale-in">
                <CardHeader className="bg-gradient-to-r from-liturgical-primary/10 to-liturgical-accent/10">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="bg-liturgical-primary/20 text-liturgical-primary animate-pulse-glow"
                    >
                      {liturgicalData.informations?.jour_liturgique_nom || "Temps liturgique"}
                    </Badge>
                    {isFavorite && (
                      <Badge variant="outline" className="text-red-500 border-red-500 animate-pulse">
                        ♥ Favori
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-center text-liturgical-primary">
<<<<<<< HEAD
                    {liturgicalData.messes?.[selectedMassIndex]?.nom || "Messe du jour"}
                  </CardTitle>
                  
                  {/* Sélecteur de messe si plusieurs messes sont disponibles */}
                  {hasManyMasses && (
                    <div className="mt-4 flex flex-col items-center">
                      <p className="text-sm text-muted-foreground mb-2">Choisissez la célébration :</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {liturgicalData.messes.map((messe, index) => (
                          <Button
                            key={index}
                            variant={selectedMassIndex === index ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedMassIndex(index)}
                            className={selectedMassIndex === index ? "bg-liturgical-primary hover:bg-liturgical-primary/90" : "hover-lift"}
                          >
                            {messe.nom}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
=======
                    {liturgicalData.messes?.[0]?.nom || "Messe du jour"}
                  </CardTitle>
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
                </CardHeader>
              </Card>

              {/* Lectures */}
              {readings.length > 0 ? (
                readings.map((reading: any, index: number) => {
                  // Déterminer le type de lecture
                  const readingType = reading.type as "lecture_1" | "psaume" | "lecture_2" | "evangile"

                  // Ne pas afficher les types inconnus
<<<<<<< HEAD
                  if (![
                    "lecture_1",
                    "psaume",
                    "lecture_2",
                    "evangile"
                  ].includes(readingType)) {
=======
                  if (!["lecture_1", "psaume", "lecture_2", "evangile"].includes(readingType)) {
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
                    return null
                  }

                  return (
<<<<<<< HEAD
                    <ReadingCard 
                      key={`${selectedMassIndex}-${index}`} 
                      reading={reading} 
                      type={readingType} 
                      className="animate-slide-in-right" 
                    />
=======
                    <ReadingCard key={index} reading={reading} type={readingType} className="animate-slide-in-right" />
>>>>>>> 1276b8029e146ea5c26cf6bc05cd577a9f802537
                  )
                })
              ) : (
                <Card className="liturgical-card">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Aucune lecture disponible pour cette date.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      L'API AELF pourrait être temporairement indisponible.
                    </p>
                    <Button onClick={refreshData} variant="outline" className="mt-4 hover-lift">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
