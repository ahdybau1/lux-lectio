
"use client"

import React, { useState, useRef, useEffect } from "react"
import "../styles/navbar-animations.css"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronDown, ChevronLeft, ChevronRight, RefreshCw, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ReadingCard } from "@/components/reading-card-new"

import { useLiturgical } from "@/components/liturgical-provider"

function HomePage() {
	const { currentDate, liturgicalData, refreshData, loading, error } = useLiturgical()
	const [messeIndex, setMesseIndex] = useState(0)

	// Pour déboguer
	console.log('liturgicalData:', liturgicalData)
	console.log('loading:', loading)
	console.log('error:', error)

	// Couleur liturgique dynamique (par défaut violet)
	const color = (liturgicalData?.informations?.couleur as "violet"|"vert"|"rouge"|"blanc"|"rose"|"noir") || "violet"
	const bgColorMap: Record<string, string> = {
		violet: "bg-purple-100 dark:bg-purple-900",
		vert: "bg-green-100 dark:bg-green-900",
		rouge: "bg-red-100 dark:bg-red-900",
		blanc: "bg-gray-100 dark:bg-gray-900",
		rose: "bg-pink-100 dark:bg-pink-900",
		noir: "bg-black text-white",
	}
	const bgColor = bgColorMap[color] || "bg-purple-100 dark:bg-purple-900"

	// Couleurs dynamiques pour les tabs et boutons
	// AccentColor pour tailwind (toujours une couleur de la palette Tailwind)
	const accentColor = {
		violet: "purple",
		vert: "green",
		rouge: "red",
		blanc: "zinc",
		rose: "pink",
		noir: "neutral",
	}[color] || "purple"

	return (
		<div className={`p-2 sm:p-6 max-w-3xl mx-auto min-h-screen transition-colors duration-300 ${bgColor} overflow-x-hidden`}>
			{/* Header : uniquement la sélection du type de messe si plusieurs messes */}
			{liturgicalData?.messes && liturgicalData.messes.length > 1 && (
				<div className="mb-6">
					<MesseTypeTabs
						messes={liturgicalData.messes.map((messe: any, idx: number) => ({
							...messe,
							id: `messe-${idx}`
						}))}
						messeIndex={messeIndex}
						setMesseIndex={setMesseIndex}
						accentColor={accentColor}
					/>
				</div>
			)}
			{/* Navigation horizontale pour les lectures de la messe sélectionnée (pour tous les jours) */}
			{liturgicalData?.messes && liturgicalData.messes.length > 0 ? (
				<MesseReadingsTabs
					messes={liturgicalData.messes.map((messe: any, idx: number) => ({
						...messe,
						id: `messe-${idx}`
					}))}
					messeIndex={messeIndex}
					accentColor={accentColor}
				/>
			) : (() => {
				// Si pas de messes, on affiche les lectures globales (ordre dynamique)
				let readings: any[] = []
				if (liturgicalData?.lectures && Object.keys(liturgicalData.lectures).length > 0) {
					readings = Object.values(liturgicalData.lectures)
				}
				return readings.length > 0 ? (
					<ReadingsTabs readings={readings} accentColor={accentColor} />
				) : (
					<Card className="liturgical-card">
						<CardContent className="p-8 text-center">
							<p className="text-muted-foreground">Aucune lecture disponible pour cette date.</p>
							<p className="text-sm text-muted-foreground mt-2">
								L'API AELF pourrait être temporairement indisponible.
							</p>
							<Button onClick={refreshData} variant="outline" className={`mt-4 hover:scale-105 transition-transform border-${accentColor}-500 text-${accentColor}-700`}>
								<RefreshCw className="h-4 w-4 mr-2" />
								Réessayer
							</Button>
						</CardContent>
					</Card>
				)
			})()}
		</div>
	)
}

// Synchronise le choix de la messe avec le parent
// Ajout d'emojis, couleurs et animation sur la barre de sélection de messe
function MesseTypeTabs({ messes, messeIndex, setMesseIndex, accentColor }: {
	messes: { id: string; nom: string; lectures?: any[] }[];
	messeIndex: number;
	setMesseIndex: (idx: number) => void;
	accentColor: string;
}) {
	// Emoji selon le type de messe
	const messeEmojis = ["🌙", "☀️", "🕊️", "⭐", "🔥"]
	const listRef = useRef<HTMLDivElement>(null)
	const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
	useEffect(() => {
		// Always scroll container to the leftmost position when messes change
		if (listRef.current) {
			listRef.current.scrollTo({ left: 0, behavior: "smooth" })
		}
		// Scroll to the active tab as well
		if (triggerRefs.current[messeIndex]) {
			triggerRefs.current[messeIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
		}
	}, [messeIndex, messes])
	return (
		<Tabs value={String(messeIndex)} onValueChange={(v) => setMesseIndex(Number(v))}>
			<TabsList
				ref={listRef}
				className={`rounded-lg shadow bg-${accentColor}-100 dark:bg-${accentColor}-900 border border-${accentColor}-500 flex p-1 transition-all overflow-x-auto scrollbar-thin scrollbar-thumb-${accentColor}-500 animate-navbar-tabs`}
				style={{ WebkitOverflowScrolling: 'touch' }}
			>
				{messes.map((messe, idx) => (
					<TabsTrigger
						key={messe.id}
						value={String(idx)}
						ref={el => { triggerRefs.current[idx] = el; }}
						className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 whitespace-nowrap flex-shrink-0
							data-[state=active]:bg-${accentColor}-500 data-[state=active]:text-white
							data-[state=active]:shadow-lg data-[state=active]:scale-110
							hover:bg-${accentColor}-200 hover:text-${accentColor}-900 animate-navbar-tab`}
					>
						<span>{messeEmojis[idx % messeEmojis.length]}</span>
						{messe.nom}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	)
}

function MesseReadingsTabs({ messes, messeIndex, accentColor }: {
	messes: { id: string; nom: string; lectures?: any[] }[];
	messeIndex: number;
	accentColor: string;
}) {
	// Correction : vérifier que messes[messeIndex] existe
	const currentMesse = messes && messes.length > messeIndex && messeIndex >= 0 ? messes[messeIndex] : null;
	// Utiliser l'ordre et le contenu réel de l'API (pas de mapping fixe)
	const readings = currentMesse && Array.isArray(currentMesse.lectures) ? currentMesse.lectures : [];

	return (
		<div>
			<ReadingsTabs readings={readings} accentColor={accentColor} />
		</div>
	)
}

const typeLabels: Record<string, string> = {
	lecture_1: "Première lecture",
	psaume: "Psaume",
	cantique: "Cantique",
	lecture_2: "Deuxième lecture",
	evangile: "Évangile",
}

const readingEmojis: Record<string, string> = {
	lecture_1: "📖",
	psaume: "🎵",
	cantique: "🎵",
	lecture_2: "📖",
	evangile: "✝️",
}


const typeIcons = {
	lecture_1: '📜',
	lecture_2: '📜',
	psaume: '🎵',
	cantique: '🎶',
	evangile: '📖',
	sequence: '�'
};

const typeNames = {
	lecture_1: 'Lecture_1',
	lecture_2: 'Lecture_2',
	psaume: 'Psaume',
	cantique: 'Cantique',
	evangile: 'Évangile',
	sequence: 'Séquence'
};

function ReadingsTabs({ readings, accentColor }: { readings: any[], accentColor: string }) {
	const [tab, setTab] = useState("0");
	const listRef = useRef<HTMLDivElement>(null);
	const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

	const getReadingLabel = (reading: any, idx: number) => {
		if (reading.type === 'psaume') return { icon: '🎵', name: 'Psaume' };
		if (reading.type === 'cantique') return { icon: '🎵', name: 'Cantique' };
		if (reading.type === 'evangile') return { icon: '✝️', name: 'Évangile' };
		if (reading.type === 'sequence') return { icon: '🎵', name: 'Séquence' };
		if (reading.type === 'lecture') return { icon: '📖', name: `Lecture_${idx + 1}` };

		// Déterminer le type de lecture en vérifiant les clés et le type
		let readingType = Object.keys(reading).find(key =>
			['lecture_1', 'lecture_2', 'psaume', 'cantique', 'evangile', 'sequence'].includes(key)
		);
		if (!readingType && reading.type) {
			readingType = reading.type.toLowerCase();
		}
		const icon = typeIcons[readingType as keyof typeof typeIcons] || '📄';
		const name = typeNames[readingType as keyof typeof typeNames] || `Lecture`;
		return { icon, name };
	};

	// Si nous avons exactement 2 lectures, utilisons un menu déroulant
	if (readings.length === 2) {
		const currentReading = readings[parseInt(tab)];
		const currentLabel = getReadingLabel(currentReading, parseInt(tab));

		return (
			<div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button 
							variant="outline" 
							className={`mb-4 w-full justify-between bg-${accentColor}-100 dark:bg-${accentColor}-900 
							border-${accentColor}-500 hover:bg-${accentColor}-200 hover:text-${accentColor}-900`}
						>
							<span className="flex items-center gap-2">
								{currentLabel.icon} {currentLabel.name}
							</span>
							<ChevronDown className="h-4 w-4 opacity-50" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-full min-w-[200px]">
						{readings.map((reading, idx) => {
							const label = getReadingLabel(reading, idx);
							return (
								<DropdownMenuItem
									key={idx}
									onClick={() => setTab(String(idx))}
									className="cursor-pointer"
								>
									<span className="flex items-center gap-2">
										{label.icon} {label.name}
									</span>
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
				<div className="animate-slide-in-right">
					<ReadingCard 
						reading={currentReading} 
						type={currentReading.type} 
						className="animate-slide-in-right" 
					/>
				</div>
			</div>
		);
	}

	// Sinon, utilisons les onglets comme avant
	return (
		<Tabs value={tab} onValueChange={setTab}>
			<div className="relative flex items-center">
				<TabsList
					ref={listRef}
					className={`mb-2 rounded-lg shadow bg-${accentColor}-100 dark:bg-${accentColor}-900 border border-${accentColor}-500 flex p-1 transition-all overflow-x-auto scrollbar-thin animate-navbar-tabs scrollbar-visible`}
					style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', minWidth: 'fit-content' }}
				>
					{readings.map((reading, idx) => (
						<TabsTrigger
							key={idx}
							value={String(idx)}
							ref={el => { triggerRefs.current[idx] = el; }}
							className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 whitespace-nowrap flex-shrink-0 text-black
								data-[state=active]:bg-${accentColor}-500
								data-[state=active]:text-white dark:data-[state=active]:text-white`}
						>
							{(() => {
								const label = getReadingLabel(reading, idx);
								return label ? <span>{label.icon} {label.name}</span> : null;
							})()}
						</TabsTrigger>
					))}
				</TabsList>
			</div>
			<div className="animate-slide-in-right">
				<ReadingCard 
					reading={readings[parseInt(tab)]} 
					type={readings[parseInt(tab)].type} 
					className="animate-slide-in-right" 
				/>
			</div>
		</Tabs>
	)
}

export default HomePage
