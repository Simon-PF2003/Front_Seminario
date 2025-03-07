import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private URL = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  createNewProduct(productData: FormData): Observable<any> {
    return this.http.post<any>(this.URL + '/createNewProduct', productData);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/product');
  }

  getFeaturedProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/featuredProducts');
  }

  getPendingStockProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.URL + '/pendingStock');
  }


  getNoStockProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}/noProducts`);
  }

  requestStock(productsToRequest: { _id: string, quantityToBuy: number}[]): Observable<any> {
    return this.http.patch(this.URL + '/requestStock', {productsToRequest});
  }

  getProductDetailsById(productId: any): Observable<any> {
    const url = `${this.URL}/product/${productId}`;
    return this.http.get<any>(url);
  }

  deleteProduct(productId: any) {
    const url = `${this.URL}/product/${productId}`;
    return this.http.delete(url);
  }

  updateProduct(updatedProduct: any, productId: any) {
    const url = `${this.URL}/product/${productId}`;
    return this.http.patch(url, updatedProduct);
  }

  getProductsFiltered(searchTerm: string): Observable<any[]> {
    console.log(searchTerm, 'service');
    const url = `${this.URL}/searchProducts/${searchTerm}`;
    console.log(url);
    return this.http.get<any[]>(url);
  }

  filterByCategory(category: string): Observable<any[]> {
    const url = `${this.URL}/category/${category}`;
    return this.http.get<any[]>(url);
 
  }

  actualizarStock(orderData: any) {
    console.log(orderData);
    const url = `${this.URL}/orderStockProduct`;
    return this.http.patch(url, {orderData});
  }

  updateStock(stockData: any) {
    const url = `${this.URL}/updateStock`;
    return this.http.patch(url, stockData);
  }

  notifyMe(productId: any, userId: any) {
    const url = `${this.URL}/createStockNotification`;
    return this.http.post(url, { productId, userId });
  }
}