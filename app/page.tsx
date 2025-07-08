import PokemonList from "@/components/pokemon-list"

async function getAllPokemonWithDetails() {
  console.log("Fetching all Pokemon data for static generation...")

  const pokemonListRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000")
  const pokemonListData = await pokemonListRes.json()

  console.log(`Found ${pokemonListData.results.length} Pokemon. Fetching details...`)

  const batchSize = 50
  const allPokemonDetails = []

  for (let i = 0; i < pokemonListData.results.length; i += batchSize) {
    const batch = pokemonListData.results.slice(i, i + batchSize)
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pokemonListData.results.length / batchSize)}`,
    )

    const batchPromises = batch.map(async (pokemon: any) => {
      try {
        const res = await fetch(pokemon.url)
        const details = await res.json()
        return {
          id: details.id,
          name: details.name,
          url: pokemon.url,
          sprites: details.sprites,
          types: details.types,
          height: details.height,
          weight: details.weight,
          abilities: details.abilities,
          stats: details.stats,
          moves: details.moves.slice(0, 20), 
        }
      } catch (error) {
        console.error(`Failed to fetch ${pokemon.name}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    allPokemonDetails.push(...batchResults.filter(Boolean))

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log(`Successfully fetched details for ${allPokemonDetails.length} Pokemon`)
  return allPokemonDetails
}

export default async function HomePage() {
  const allPokemonData = await getAllPokemonWithDetails()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">Pokédex</h1>
          <p className="text-lg text-gray-600 mb-4">Discover and explore the world of Pokémon</p>
          <p className="text-sm text-gray-500">
            Static site with {allPokemonData.length} Pokémon • Lightning fast browsing
          </p>
        </div>

        <PokemonList allPokemonData={allPokemonData} />
      </div>
    </div>
  )
}

// Enable static generation
// export const dynamic = "force-static"
// export const revalidate = false
