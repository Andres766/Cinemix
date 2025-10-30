'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const API_KEY = 'd2c57f3ab8d648c53961a17a25a81617'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

interface Movie {
  id: number
  title: string
  poster_path: string | null
  overview: string
  release_date: string
  vote_average: number
  backdrop_path: string | null
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [trending, setTrending] = useState<Movie[]>([])

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`
      )
      const data = await response.json()
      setTrending(data.results.slice(0, 6))
      setMovies(data.results)
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
  }

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      fetchTrending()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(
          query
        )}`
      )
      const data = await response.json()
      setMovies(data.results)
    } catch (error) {
      console.error('Error searching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchMovies(searchQuery)
  }

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4 text-white">
              CineMix
            </h1>
            <p className="text-gray-400 text-lg">
              Descubre tu próxima película favorita
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-16">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar películas..."
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Trending Section */}
          {!searchQuery && trending.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">
                🔥 Tendencias de la Semana
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trending.map((movie) => (
                  <div
                    key={movie.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                      {movie.poster_path ? (
                        <Image
                          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-600">Sin imagen</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Movies Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="group cursor-pointer"
              onClick={() => setSelectedMovie(movie)}
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-lg">
                {movie.poster_path ? (
                  <Image
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600">Sin imagen</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-medium">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                {movie.title}
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                {movie.release_date?.split('-')[0] || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="bg-gray-900/95 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 md:h-96">
              {selectedMovie.backdrop_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path}`}
                  alt={selectedMovie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedMovie.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{selectedMovie.release_date?.split('-')[0]}</span>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      {selectedMovie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Sinopsis</h3>
                <p className="text-gray-300 leading-relaxed">
                  {selectedMovie.overview || 'No hay sinopsis disponible.'}
                </p>
              </div>

              <button
                onClick={() => setSelectedMovie(null)}
                className="mt-8 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}