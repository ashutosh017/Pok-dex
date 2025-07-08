"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, RotateCcw, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PokemonData {
  id: number
  name: string
  url: string
  sprites: {
    front_default: string
    other: {
      "official-artwork": {
        front_default: string
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
  height: number
  weight: number
  abilities: Array<{
    ability: {
      name: string
    }
    is_hidden: boolean
  }>
  stats: Array<{
    base_stat: number
    stat: {
      name: string
    }
  }>
  moves: Array<{
    move: {
      name: string
    }
  }>
}

interface PokemonListProps {
  allPokemonData: PokemonData[]
}

export default function PokemonList({ allPokemonData }: PokemonListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("id")

  // Get all unique types for filter
  const allTypes = useMemo(() => {
    const types = new Set<string>()
    allPokemonData.forEach((pokemon) => {
      pokemon.types.forEach((type) => types.add(type.type.name))
    })
    return Array.from(types).sort()
  }, [allPokemonData])

  // Memoized filtered and sorted Pokemon
  const processedPokemon = useMemo(() => {
    let filtered = allPokemonData

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pokemon) =>
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) || pokemon.id.toString().includes(searchTerm),
      )
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((pokemon) => pokemon.types.some((type) => type.type.name === typeFilter))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "id":
          return a.id - b.id
        case "height":
          return b.height - a.height
        case "weight":
          return b.weight - a.weight
        default:
          return a.id - b.id
      }
    })

    return filtered
  }, [allPokemonData, searchTerm, typeFilter, sortBy])

  // Memoized pagination
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(processedPokemon.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentPokemon = processedPokemon.slice(startIndex, endIndex)

    return {
      totalPages,
      currentPokemon,
      startIndex,
      endIndex,
      totalCount: processedPokemon.length,
    }
  }, [processedPokemon, currentPage, itemsPerPage, sortBy])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, sortBy, itemsPerPage])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationData.totalPages) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setSortBy("id")
  }

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

  const renderPageNumbers = () => {
    const { totalPages } = paginationData
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      pages.push(
        <Button key={1} onClick={() => handlePageChange(1)} variant="ghost" size="sm">
          1
        </Button>,
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="text-gray-400">
            ...
          </span>,
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button key={i} onClick={() => handlePageChange(i)} variant={i === currentPage ? "outline" : "ghost"} size="sm">
          {i}
        </Button>,
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="text-gray-400">
            ...
          </span>,
        )
      }
      pages.push(
        <Button key={totalPages} onClick={() => handlePageChange(totalPages)} variant="ghost" size="sm">
          {totalPages}
        </Button>,
      )
    }

    return pages
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center justify-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg w-80"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {allTypes.map((type) => (
              <SelectItem className="backdrop-blur-lg" key={type} value={type}>
                <span className="capitalize">{type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="backdrop-blur-lg" value="id">Sort by ID</SelectItem>
            <SelectItem className="backdrop-blur-lg" value="name">Sort by Name</SelectItem>
            <SelectItem className="backdrop-blur-lg" value="height">Sort by Height</SelectItem>
            <SelectItem className="backdrop-blur-lg" value="weight">Sort by Weight</SelectItem>
          </SelectContent>
        </Select>

        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="backdrop-blur-lg" value="12">12 per page</SelectItem>
            <SelectItem className="backdrop-blur-lg" value="20">20 per page</SelectItem>
            <SelectItem className="backdrop-blur-lg" value="50">50 per page</SelectItem>
            <SelectItem className="backdrop-blur-lg" value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || typeFilter !== "all" || sortBy !== "id") && (
          <Button onClick={clearFilters} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Info */}
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Showing {paginationData.totalCount} Pokémon • Page {currentPage} of {paginationData.totalPages}
          {(searchTerm || typeFilter !== "all") && (
            <span className="ml-2">
              <Badge variant="secondary">
                <Filter className="h-3 w-3 mr-1" />
                Filtered
              </Badge>
            </span>
          )}
        </p>
      </div>

      {/* Navigation */}
      {paginationData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">{renderPageNumbers()}</div>

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= paginationData.totalPages}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pokemon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {paginationData.currentPokemon.map((pokemon) => (
          <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer bg-white">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <Image
                      src={
                        pokemon.sprites.other["official-artwork"].front_default ||
                        pokemon.sprites.front_default ||
                        "/placeholder.svg?height=96&width=96"
                      }
                      alt={pokemon.name}
                      fill
                      className="object-contain"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="font-semibold text-lg capitalize mb-2">{pokemon.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">#{pokemon.id.toString().padStart(3, "0")}</p>

                  <div className="flex flex-wrap gap-1 justify-center mb-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(type.type.name)}`}
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Height: {pokemon.height / 10}m</div>
                    <div>Weight: {pokemon.weight / 10}kg</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {paginationData.totalCount === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">No Pokémon found with current filters</p>
          <Button onClick={clearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Bottom Navigation */}
      {paginationData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-gray-600 px-4">
            Page {currentPage} of {paginationData.totalPages}
          </span>

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= paginationData.totalPages}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
