import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, CreateTransactionRequest } from '../models/transaction';
import { ApiResponse, ApiPaginatedResponse} from '../models/api-response';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) { }

  createTransaction(transaction: CreateTransactionRequest): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(this.apiUrl, transaction);
  }
  
  getTransactionsByAccount(id: string, page: number, limit: number): Observable<ApiPaginatedResponse<Transaction[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiPaginatedResponse<Transaction[]>>(`${this.apiUrl}/account/${id}`, {params});
  }
}
