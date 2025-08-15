import type { AelfReading } from "@/lib/api"
import React from "react"

interface ReadingCardProps {
  reading: AelfReading
  type: "lecture_1" | "psaume" | "lecture_2" | "evangile"
  className?: string
}

const typeLabels = {
  lecture_1: "Première lecture",
  psaume: "Psaume",
  lecture_2: "Deuxième lecture",
  evangile: "Évangile",
}


export function ReadingCard({ reading, type, className = "" }: ReadingCardProps) {
  const reference = reading.reference || reading.ref || ""
  return (
    <div className={`w-full my-6 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-bold text-xs uppercase tracking-wide opacity-80">{typeLabels[type]}</span>
        {reference && <span className="text-xs text-gray-500 ml-2">{reference}</span>}
      </div>
      {reading.titre && (
        <h3 className="font-semibold mb-2 text-base text-gray-800 dark:text-gray-200">{reading.titre}</h3>
      )}
      {reading.refrain_psalmique && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4 italic border-l-4 border-green-500">
          <div
            className="text-green-800 dark:text-green-200 font-medium"
            dangerouslySetInnerHTML={{ __html: reading.refrain_psalmique }}
          />
        </div>
      )}
      {reading.verset_evangile && (
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md mb-4 border-l-4 border-amber-500">
          <div
            className="text-amber-800 dark:text-amber-200"
            dangerouslySetInnerHTML={{ __html: reading.verset_evangile }}
          />
        </div>
      )}
      <div
        className={`prose prose-sm max-w-none dark:prose-invert leading-relaxed ${type === "psaume" ? "italic" : ""}`}
        dangerouslySetInnerHTML={{ __html: reading.contenu }}
      />
    </div>
  )
}
