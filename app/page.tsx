'use client'
import { useState, useEffect } from 'react'
import type React from 'react'

type MediaItem = {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  vote_average?: number
  overview?: string
  release_date?: string
  first_air_date?: string
}

type Genre = {
  id: number
  name: string
}

const API_KEY = 'd2c57f3ab8d648c53961a17a25a81617'
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export default function CineMix() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedMovie, setSelectedMovie] = useState<MediaItem | null>(null)
  const [trending, setTrending] = useState<MediaItem[]>([])
  const [featured, setFeatured] = useState<MediaItem | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [currentView, setCurrentView] = useState<'home' | 'movies' | 'series' | 'mylist'>('home')
  const [myList, setMyList] = useState<MediaItem[]>([])

  useEffect(() => {
    fetchGenres()
    fetchTrending()
    fetchFeatured()
  }, [])

  useEffect(() => {
    handleViewChange(currentView)
  }, [currentView])

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`
      )
      const data = await response.json()
      setGenres(data.genres || [])
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  const fetchFeatured = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES`
      )
      const data = await response.json()
      setFeatured(data.results[0])
    } catch (error) {
      console.error('Error fetching featured:', error)
    }
  }

  const fetchTrending = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=es-ES`
      )
      const data = await response.json()
      setTrending(data.results.slice(0, 10))
      setMovies(data.results)
    } catch (error) {
      console.error('Error fetching trending:', error)
    }
  }

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc`
      )
      const data = await response.json()
      setMovies(data.results)
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc`
      )
      const data = await response.json()
      setMovies(data.results)
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewChange = (view: 'home' | 'movies' | 'series' | 'mylist') => {
    setSearchQuery('')
    setSelectedGenre(null)
    
    switch(view) {
      case 'home':
        fetchTrending()
        fetchFeatured()
        break
      case 'movies':
        fetchMovies()
        setFeatured(null)
        break
      case 'series':
        fetchSeries()
        setFeatured(null)
        break
      case 'mylist':
        setMovies(myList)
        setFeatured(null)
        break
    }
  }

  const fetchByGenre = async (genreId: number) => {
    setLoading(true)
    try {
      const endpoint = currentView === 'series' ? 'tv' : 'movie'
      const response = await fetch(
        `${BASE_URL}/discover/${endpoint}?api_key=${API_KEY}&language=es-ES&with_genres=${genreId}`
      )
      const data = await response.json()
      setMovies(data.results)
      setSelectedGenre(genreId)
    } catch (error) {
      console.error('Error fetching by genre:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchMovies = async (query: string) => {
    if (!query.trim()) {
      handleViewChange(currentView)
      return
    }

    setLoading(true)
    setSelectedGenre(null)
    try {
      const endpoint = currentView === 'series' ? 'tv' : 'movie'
      const response = await fetch(
        `${BASE_URL}/search/${endpoint}?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(
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

  const handleSearch = () => {
    searchMovies(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const addToMyList = (movie: MediaItem) => {
    if (!myList.find(m => m.id === movie.id)) {
      setMyList([...myList, movie])
    }
  }

  const removeFromMyList = (movieId: number) => {
    setMyList(myList.filter(m => m.id !== movieId))
  }

  const isInMyList = (movieId: number) => {
    return myList.some(m => m.id === movieId)
  }

  const getTitle = (item: MediaItem) => item.title || item.name || 'Sin título'
  const getDate = (item: MediaItem) => item.release_date || item.first_air_date || ''

  const getEndpointForItem = (item: MediaItem): 'movie' | 'tv' => (item.title ? 'movie' : 'tv')

  type VideoResult = {
    key: string
    type?: string
    site?: string
  }

  const openTMDB = (item: MediaItem) => {
    const endpoint = getEndpointForItem(item)
    const url = `https://www.themoviedb.org/${endpoint}/${item.id}`
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  }

  const playTrailer = async (item: MediaItem) => {
    try {
      const endpoint = getEndpointForItem(item)
      const response = await fetch(
        `${BASE_URL}/${endpoint}/${item.id}/videos?api_key=${API_KEY}&language=es-ES`
      )
      const data = await response.json()
      const results: VideoResult[] = data.results || []
      const trailer = results.find(v => v.type === 'Trailer' && v.site === 'YouTube') || results[0]
      if (trailer?.key && typeof window !== 'undefined') {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')
      }
    } catch (error) {
      console.error('Error reproduciendo trailer:', error)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a14] text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎬</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                CineMix
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-6 text-sm">
              <button 
                onClick={() => setCurrentView('home')}
                className={`transition-colors ${currentView === 'home' ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
              >
                Inicio
              </button>
              <button 
                onClick={() => setCurrentView('movies')}
                className={`transition-colors ${currentView === 'movies' ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
              >
                Películas
              </button>
              <button 
                onClick={() => setCurrentView('series')}
                className={`transition-colors ${currentView === 'series' ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
              >
                Series
              </button>
              <button 
                onClick={() => setCurrentView('mylist')}
                className={`transition-colors ${currentView === 'mylist' ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
              >
                Mi Lista <span className="text-purple-400">({myList.length})</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {featured && currentView === 'home' && !searchQuery && (
        <div className="relative h-[70vh] mb-12 overflow-hidden">
          <div className="absolute inset-0">
            {featured.backdrop_path && (
              <img
                src={`https://image.tmdb.org/t/p/original${featured.backdrop_path}`}
                alt={getTitle(featured)}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent"></div>
          </div>
          
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="inline-block px-4 py-1 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full mb-4">
                <span className="text-purple-300 text-sm font-medium">✨ Destacada</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                {getTitle(featured)}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-lg">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{Number(featured.vote_average ?? 0).toFixed(1)}</span>
                </div>
                <span className="text-gray-300">{getDate(featured)?.split('-')[0]}</span>
              </div>
              <p className="text-gray-300 text-lg mb-8 line-clamp-3">
                {featured.overview}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedMovie(featured)}
                  className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <span>▶</span> Ver Detalles
                </button>
                <button 
                  onClick={() => addToMyList(featured)}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  + Mi Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative flex items-center">
              <button
                type="button"
                aria-label="Buscar"
                onClick={handleSearch}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-2 text-gray-400 hover:text-white focus:outline-none"
                title="Buscar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Buscar ${currentView === 'series' ? 'series' : 'películas'}...`}
                className="w-full pl-14 pr-32 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/50"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Genre Pills */}
        {currentView !== 'mylist' && (
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
            <button
              onClick={() => {
                handleViewChange(currentView)
                setSelectedGenre(null)
                setSearchQuery('')
              }}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedGenre === null
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              Todos
            </button>
            {genres.slice(0, 8).map((genre) => (
              <button
                key={genre.id}
                onClick={() => fetchByGenre(genre.id)}
                className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedGenre === genre.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}

        {/* Trending Carousel */}
        {!searchQuery && trending.length > 0 && currentView === 'home' && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              Tendencias de la Semana
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {trending.map((movie, idx) => (
                <div
                  key={movie.id}
                  className="relative flex-shrink-0 w-48 group cursor-pointer"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-2xl">
                    {movie.poster_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={getTitle(movie)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-600 text-4xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-2 left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-xs font-semibold">
                        {Number(movie.vote_average ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors px-1">
                    {getTitle(movie)}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-400">Cargando {currentView === 'series' ? 'series' : 'películas'}...</p>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {currentView === 'mylist' ? 'Mi Lista' : 
               searchQuery ? `Resultados para "${searchQuery}"` : 
               selectedGenre ? genres.find(g => g.id === selectedGenre)?.name : 
               currentView === 'series' ? 'Series Populares' : 
               currentView === 'movies' ? 'Películas Populares' : 'Todas las películas'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="group cursor-pointer transform hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-2xl">
                    {movie.poster_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                        alt={getTitle(movie)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-600 text-4xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="bg-purple-500 px-2 py-1 rounded">Ver más</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">⭐</span>
                      <span className="text-xs font-semibold">
                        {Number(movie.vote_average ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {getTitle(movie)}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    {getDate(movie)?.split('-')[0] || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {currentView === 'mylist' ? '📋' : '🔍'}
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {currentView === 'mylist' ? 'Tu lista está vacía' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-400">
              {currentView === 'mylist' ? 'Agrega películas y series a tu lista' : 'Intenta con otra búsqueda'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="bg-[#1a1a2e] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="relative h-80 md:h-96">
              {selectedMovie.backdrop_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path}`}
                  alt={getTitle(selectedMovie)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/50 to-transparent"></div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all hover:rotate-90 duration-300"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8">
                {selectedMovie.poster_path && (
                  <div className="flex-shrink-0 w-48 mx-auto md:mx-0">
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                      <img
                        src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`}
                        alt={getTitle(selectedMovie)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    {getTitle(selectedMovie)}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-xl border border-yellow-500/30">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="font-bold text-xl">{Number(selectedMovie.vote_average ?? 0).toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">/10</span>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                      <span className="text-gray-300">{getDate(selectedMovie)?.split('-')[0]}</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <span>📝</span> Sinopsis
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {selectedMovie.overview || 'No hay sinopsis disponible.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button onClick={() => playTrailer(selectedMovie!)} className="flex-1 min-w-[200px] py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2">
                      <span>▶</span> Reproducir
                    </button>
                    {isInMyList(selectedMovie.id) ? (
                      <button 
                        onClick={() => removeFromMyList(selectedMovie.id)}
                        className="px-6 py-4 bg-purple-500/20 border border-purple-500 rounded-xl hover:bg-purple-500/30 transition-all"
                        title="Quitar de mi lista"
                      >
                        <span className="text-xl">✓</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => addToMyList(selectedMovie)}
                        className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                        title="Agregar a mi lista"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    )}
                    <button onClick={() => (isInMyList(selectedMovie!.id) ? removeFromMyList(selectedMovie!.id) : addToMyList(selectedMovie!))} className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all" title={isInMyList(selectedMovie!.id) ? 'Quitar de mi lista' : 'Agregar a mi lista'}>
                      <span className="text-xl">❤️</span>
                    </button>
                    <button onClick={() => openTMDB(selectedMovie!)} className="px-6 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all" title="Abrir en TMDB">
                      <span className="text-xl">↗️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}