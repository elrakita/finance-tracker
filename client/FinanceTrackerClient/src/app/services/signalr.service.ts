import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, bufferTime, filter} from 'rxjs';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private _balanceData$ = new Subject<{ accountId: string, newBalance: number }>();
  public balanceData$ = this._balanceData$.asObservable();
  private _balanceNotify$ = new Subject<{ accountName: string }>();
  public balanceNotify$ = this._balanceNotify$.asObservable();

  public connectionStatus$ = new Subject<string>();
  private currentConnectionId: string | null = null;

  private snackBar = inject(MatSnackBar);

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => localStorage.getItem('auth-token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveConnectionId', (id: string) => {
      this.currentConnectionId = id;
    });

    this.hubConnection.on('ReceiveBalanceUpdate', 
      (accountId: string, newBalance: number, accountName: string, senderConnectionId: string) => {     
        this._balanceData$.next({ accountId, newBalance });
        if (this.currentConnectionId !== senderConnectionId) {
          this._balanceNotify$.next({ accountName });
        }
    });

    this.hubConnection.onreconnecting(() => this.connectionStatus$.next('Reconnecting...'));
    this.hubConnection.onreconnected(() => this.connectionStatus$.next('Connected'));
    this.hubConnection.onclose(() => this.connectionStatus$.next('Disconnected'));

    this.hubConnection.start()
      .then(() => this.connectionStatus$.next('Connected'))
      .catch(err => console.error('Error while starting connection: ' + err));

    this.balanceNotify$
      .pipe(
        bufferTime(800),
        filter(updates => updates.length > 0)
      )
      .subscribe(updates => {
        const uniqueNames = [...new Set(updates.map(u => u.accountName))];
        const count = uniqueNames.length;
        
        let message = '';

        if (count === 1) {
          message = `Balance updated for ${uniqueNames[0]}`;
        } else if (count === 2) {
          message = `Balances updated for ${uniqueNames[0]} and ${uniqueNames[1]}`;
        } else {
          message = `Balances updated for ${uniqueNames[0]}, ${uniqueNames[1]} +${count - 2} more`;
        }

        this.snackBar.open(message, 'Dismiss', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      });
  }

  public getConnectionId(): string | null {
    return this.currentConnectionId;
  }
}
