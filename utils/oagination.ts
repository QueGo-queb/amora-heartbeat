/**
 * Utilitaires pour la pagination
 */

export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
  }
  
  export function calculatePagination(page: number, limit: number): PaginationParams {
    return {
      page,
      limit,
      offset: (page - 1) * limit
    };
  }
  
  export function hasNextPage(currentPage: number, totalItems: number, limit: number): boolean {
    return currentPage * limit < totalItems;
  }
  
  export function hasPreviousPage(currentPage: number): boolean {
    return currentPage > 1;
  }