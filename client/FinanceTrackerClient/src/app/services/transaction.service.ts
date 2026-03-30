import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, CreateTransactionRequest } from '../models/transaction';
import { ApiResponse, ApiPaginatedResponse} from '../models/api-response';
import { environment } from '../../environments/environment';
import { SignalRService } from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(
    private http: HttpClient,
    private signalRService: SignalRService 
  ) { }

  createTransaction(transaction: CreateTransactionRequest): Observable<ApiResponse<Transaction>> {
    const connectionId = this.signalRService.getConnectionId();
    let headers = new HttpHeaders();
    if (connectionId) {
      headers = headers.set('X-SignalR-Connection-Id', connectionId);
    }
    return this.http.post<ApiResponse<Transaction>>(this.apiUrl, transaction, {headers});
  }
  
  getTransactionsByAccount(id: string, page: number, limit: number): Observable<ApiPaginatedResponse<Transaction[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiPaginatedResponse<Transaction[]>>(`${this.apiUrl}/account/${id}`, {params});
  }
}
