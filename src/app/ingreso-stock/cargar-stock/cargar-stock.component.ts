import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cargar-stock',
  templateUrl: './cargar-stock.component.html',
  styleUrls: ['./cargar-stock.component.css']
})
export class CargarStockComponent implements OnInit {
  products: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';

  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      this.searchTerm = queryParams['q'] || '';
      this.fetchProducts();
    });
  }

  async fetchProducts() {
    try {
      const productsPending = await firstValueFrom(this.productService.getPendingStockProducts());
      this.products = productsPending.filter(product => product.pending > 0);
      
      if (this.searchTerm) {
        try {
          const filteredData = await firstValueFrom(this.productService.getProductsFiltered(this.searchTerm));
          const stockFilteredData = filteredData.filter(product => product.stock < product.stockMin);

          if (stockFilteredData.length === 0) {
            Swal.fire('Sin resultados', 'No hay productos que cumplan con la descripción ingresada', 'info');
          }

          this.products = stockFilteredData;
        } catch (error) {
          if ((error as any).status === 400) {
            this.products = [];
          } else {
            console.error('Error al buscar productos', error);
          }
        }
      }

      /*if (this.products.length === 0) {
        Swal.fire({
          title: 'Información',
          text: 'No hay productos con stock pendiente.',
          icon: 'info',
          confirmButtonText: 'Aceptar'
        });
      } else {
        this.products.forEach(product => product.quantityToAdd = product.pending);
      }*/
      this.products.forEach(product => product.quantityToAdd = product.pending);
      this.updatePagination();
    } catch (error) {
      console.error('Error fetching pending stock products', error);
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.products.length / this.pageSize);
    this.currentPage = 1;
    this.updateDisplayedProducts();
  }

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

  confirmarCambioCantidad(product: any) {
    if (product.quantityToAdd !== product.pending) {
      Swal.fire({
        title: 'Cantidad modificada',
        text: `Has cambiado la cantidad de ${product.pending} a ${product.quantityToAdd}.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  verificarCantidad(product: any) {
    if (product.quantityToAdd !== product.pending) {
      Swal.fire({
        title: 'Advertencia',
        text: 'La cantidad ingresada no coincide con la cantidad solicitada. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ingresarStock([product]);
        }
      });
    } else {
      this.ingresarStock([product]);
    }
  }

  ingresarStock(products: any[]) {
    const productsToUpdate = products.map(product => ({
      _id: product._id,
      quantityToBuy: product.quantityToAdd
    }));

    this.productService.updateStock({ productsToUpdate }).subscribe(
      () => {
        Swal.fire('Éxito', 'Stock ingresado correctamente', 'success');
        this.fetchProducts();
      },
      (error) => {
        console.error('Error al ingresar stock:', error);
        Swal.fire('Error', 'Hubo un problema al ingresar el stock', 'error');
      }
    );
  }

  ingresarTodoElStock() {
    if (this.products.length === 0) {
      Swal.fire('Información', 'No hay productos con stock pendiente.', 'info');
      return;
    }
  
    // Verificar si hay discrepancias en la cantidad a ingresar
    const productosConDiferencia = this.products.filter(
      product => product.quantityToAdd !== product.pending
    );
  
    if (productosConDiferencia.length > 0) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Algunos productos tienen una cantidad ingresada diferente a la cantidad pendiente. ¿Desea continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ingresarStock(this.products);
        }
      });
    } else {
      this.ingresarStock(this.products);
    }
  }
  
}