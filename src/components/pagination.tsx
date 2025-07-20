// src/components/pagination.tsx

import { Button } from './ui/button'

import { ChevronLeft, ChevronRight } from 'lucide-react'

// Componente de paginación responsive
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = []
    const showPages = window.innerWidth < 640 ? 3 : 5 // Menos páginas en mobile

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    const endPage = Math.min(totalPages, startPage + showPages - 1)

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 px-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        className="text-xs sm:text-sm px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">
          <ChevronLeft className="h-4 w-4" />
        </span>
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className="text-xs sm:text-sm px-2 sm:px-3 min-w-[32px] sm:min-w-[36px]"
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        className="text-xs sm:text-sm px-2 sm:px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">
          <ChevronRight className="h-4 w-4" />
        </span>
      </Button>
    </div>
  )
}
