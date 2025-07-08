import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Generate static params for all Pokemon
export async function generateStaticParams() {
  console.log("Generating static params for all Pokemon...")

  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000")
  const data = await res.json()

  const params = data.results.map((pokemon: any) => {
    const id = pokemon.url.split("/").slice(-2, -1)[0]
    return { id }
  })

  console.log(`Generated ${params.length} static params`)
  return params
}

async function getPokemonData(id: string) {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    ])

    if (!pokemonRes.ok) return null

    const pokemon = await pokemonRes.json()
    const species = speciesRes.ok ? await speciesRes.json() : null

    return { pokemon, species }
  } catch (error) {
    console.error(`Failed to fetch Pokemon ${id}:`, error)
    return null
  }
}

export default async function PokemonDetailPage({ params }: { params: { id: string } }) {
  const data = await getPokemonData(params.id)

  if (!data) {
    notFound()
  }

  const { pokemon, species } = data

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-200",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300",
    }
    return colors[type] || "bg-gray-400"
  }

  const description = species?.flavor_text_entries
    ?.find((entry: any) => entry.language.name === "en")
    ?.flavor_text?.replace(/\f/g, " ")

  const prevId = pokemon.id > 1 ? pokemon.id - 1 : null
  const nextId = pokemon.id < 1010 ? pokemon.id + 1 : null // Approximate max Pokemon ID

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pokédex
          </Link>

          <div className="flex gap-2">
            {prevId && (
              <Link href={`/pokemon/${prevId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />#{prevId.toString().padStart(3, "0")}
                </Button>
              </Link>
            )}
            {nextId && (
              <Link href={`/pokemon/${nextId}`}>
                <Button variant="outline" size="sm">
                  #{nextId.toString().padStart(3, "0")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pokemon Image and Basic Info */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="relative w-64 h-64 mx-auto mb-6">
                <Image
                  src={
                    pokemon.sprites.other["official-artwork"].front_default ||
                    pokemon.sprites.front_default ||
                    "/placeholder.svg?height=256&width=256"
                  }
                  alt={pokemon.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold capitalize mb-2">{pokemon.name}</h1>
              <p className="text-xl text-gray-600 mb-4">#{pokemon.id.toString().padStart(3, "0")}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {pokemon.types.map((type: any) => (
                  <Badge key={type.type.name} className={`${getTypeColor(type.type.name)} text-white hover:opacity-80`}>
                    {type.type.name}
                  </Badge>
                ))}
              </div>
              {description && <p className="text-gray-700 leading-relaxed">{description}</p>}
            </CardContent>
          </Card>

          {/* Pokemon Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Base Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pokemon.stats.map((stat: any) => (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{stat.stat.name.replace("-", " ")}</span>
                      <span className="text-sm font-bold">{stat.base_stat}</span>
                    </div>
                    <Progress value={(stat.base_stat / 255) * 100} className="h-2" />
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{pokemon.height / 10}m</p>
                  <p className="text-sm text-gray-600">Height</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{pokemon.weight / 10}kg</p>
                  <p className="text-sm text-gray-600">Weight</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Abilities */}
          <Card>
            <CardHeader>
              <CardTitle>Abilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pokemon.abilities.map((ability: any) => (
                  <div key={ability.ability.name} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{ability.ability.name.replace("-", " ")}</span>
                    {ability.is_hidden && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Moves */}
          <Card>
            <CardHeader>
              <CardTitle>Moves (First 15)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {pokemon.moves.slice(0, 15).map((move: any) => (
                  <Badge key={move.move.name} variant="outline" className="justify-center">
                    {move.move.name.replace("-", " ")}
                  </Badge>
                ))}
              </div>
              {pokemon.moves.length > 15 && (
                <p className="text-sm text-gray-600 mt-4 text-center">+{pokemon.moves.length - 15} more moves</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Enable static generation
export const dynamic = "force-static"
export const revalidate = false
