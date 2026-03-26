import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  public balanceUpdate$ = new Subject<{ accountId: string, newBalance: number }>();
  public connectionStatus$ = new Subject<string>();

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5143/financeHub', {
        accessTokenFactory: () => localStorage.getItem('auth-token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveBalanceUpdate', (accountId: string, newBalance: number) => {
      this.balanceUpdate$.next({ accountId, newBalance });
    });

    this.hubConnection.onreconnecting(() => this.connectionStatus$.next('Reconnecting...'));
    this.hubConnection.onreconnected(() => this.connectionStatus$.next('Connected'));
    this.hubConnection.onclose(() => this.connectionStatus$.next('Disconnected'));

    this.hubConnection.start()
      .then(() => this.connectionStatus$.next('Connected'))
      .catch(err => console.error('Error while starting connection: ' + err));
  }
}
