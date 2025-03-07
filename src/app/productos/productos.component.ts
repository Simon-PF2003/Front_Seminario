import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CategorySelectionService } from '../services/category-selection-service.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';
  sortOrder: string = 'none';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private categorySelectionService: CategorySelectionService
  ) {}

  async ngOnInit() {
    // Verifica la autenticación al cargar la página
    this.authService.checkAuthAndRedirect();

    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || ''; // Obtiene el término de búsqueda de la URL
      this.fetchProducts();
    });

    this.categorySelectionService.categorySelected$.subscribe(async (category) => {
      await this.filterByCategory(category);
    });
  }

  async fetchProducts() {
    try {
      let data;
      if (this.searchTerm === 'Todos' || !this.searchTerm) {
        data = await firstValueFrom(this.productService.getProducts());
      } else {
        data = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
      }

      this.products = data || [];
      this.totalPages = Math.ceil(this.products.length / this.pageSize);
      this.updateDisplayedProducts();
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  }

  async filterByCategory(category: string) {
    try {
      this.products = await firstValueFrom(this.productService.filterByCategory(category)) || [];
    } catch (error) {
      this.products = await firstValueFrom(this.productService.getProducts()) || [];
      console.error('Error fetching products by category', error);
    }

    this.totalPages = Math.ceil(this.products.length / this.pageSize);
    this.updateDisplayedProducts();
  }

  sortProducts() {
    if (this.sortOrder === 'asc') {
      this.products.sort((a, b) => a.price - b.price); // Ordena por precio ascendente
    } else if (this.sortOrder === 'desc') {
      this.products.sort((a, b) => b.price - a.price); // Ordena por precio descendente
    }
    this.updateDisplayedProducts();
  }

  // Actualiza los productos mostrados según la página actual
  updateDisplayedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedProducts = this.products.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProducts();
    }
  }
}
