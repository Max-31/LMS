"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { fetchGenres } from "@/lib/api" // Removed import

type SearchFilters = {
  query: string
  author: string
  genre: string
}

type BookSearchBoxProps = {
  onSearch: (filters: SearchFilters) => void
}

type Genre = {
  _id: string
  name: string
}

const BookSearchBox = ({ onSearch }: BookSearchBoxProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    author: "",
    genre: "",
  })
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoadingGenres, setIsLoadingGenres] = useState(false)

  useEffect(() => {
    const loadGenres = async () => {
      setIsLoadingGenres(true)
      try {
        const response = await fetch("http://localhost:5000/api/genres/")
        if (!response.ok) {
          throw new Error("Failed to fetch genres")
        }
        const genresData = await response.json()
        setGenres(genresData)
      } catch (error) {
        console.error("Error loading genres:", error)
      } finally {
        setIsLoadingGenres(false)
      }
    }

    loadGenres()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenreChange = (value: string) => {
    setFilters((prev) => ({ ...prev, genre: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center mb-4 relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          name="query"
          placeholder="Search by title, author, or ISBN..."
          value={filters.query}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div>
          <Input type="text" name="author" placeholder="Author" value={filters.author} onChange={handleInputChange} />
        </div>
        <div>
          <Select value={filters.genre} onValueChange={handleGenreChange} disabled={isLoadingGenres}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingGenres ? "Loading genres..." : "Select Genre"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre._id} value={genre._id}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <Button type="submit" className="w-full">
            Search
          </Button>
        </div>
      </div>
    </form>
  )
}

export default BookSearchBox