import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../services/account.service';
import { TransactionService } from '../../services/transaction.service';
import { Account, AccountType } from '../../models/account';
import { AccountDialogComponent } from '../account-dialog/account-dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { TransactionDialogComponent } from '../transaction-dialog/transaction-dialog';


@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule,
    MatSidenavModule,
    MatPaginatorModule,
    MatIconModule],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss'
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  error: string | null = null;
  transactionsError: string | null = null;
  private dialog = inject(MatDialog);

  selectedAccount: Account | null = null;
  transactions: any[] = [];
  transactionsLoading = false;
  totalTransactions = 0;
  currentPage = 0;

  constructor(private accountService: AccountService, 
    private transactionService: TransactionService) 
  { }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    this.accountService.getAccounts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.accounts = response.data;
          this.loading = false;
          console.log('Accounts loaded:', response.data);
        } else {
          this.error = response.message || 'Failed to load accounts';
          this.loading = false;
          console.error('API Error:', response.message);
        }
      },
      error: (error) => {
        this.error = 'Failed to load accounts';
        this.loading = false;
        console.error('Error loading accounts:', error);
      }
    });
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      panelClass: 'custom-dialog-container',
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAccounts();
      }
    });
  }

  getAccountTypeName(type: AccountType): string {
    switch (type) {
      case AccountType.Checking: return 'Checking';
      case AccountType.Savings: return 'Savings';
      case AccountType.CreditCard: return 'Credit Card';
      default: return 'Unknown';
    }
  }

  onEdit(account: any) {
    const dialogRef = this.dialog.open(AccountDialogComponent, {
      data: account,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAccounts();
      }
    });
  }

  onDelete(account: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { 
        title: "Confirm Deletion", 
        message: `Are you sure you want to delete the account: ${account.name}?`
      },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.deleteAccount(account.id).subscribe({
          next: () => {
            this.loadAccounts();
          },
          error: (err) => {
            console.error('Delete failed', err);
          }
        });
      }
    });
  }


  onAddTransaction(account: Account) {
     const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '600px',
      data: { accountId: account.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAccounts();
        if (this.selectedAccount?.id === account.id) {
          this.loadTransactions(account.id);
        }
      }
    });
  }

  onViewTransactions(account: Account, drawer: any) {
    this.selectedAccount = account;
    this.transactions = [];
    this.currentPage = 0;
    this.loadTransactions(account.id);
    drawer.open();
  }

  loadTransactions(accountId: string) {
    this.transactionsLoading = true;
    this.transactionsError = null;

    this.transactionService.getTransactionsByAccount(accountId, this.currentPage, 10)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.transactions = response.data;
            this.totalTransactions = response.total || response.data.length;
            this.transactionsLoading = false;
          } else {
            this.transactionsError = response.message || 'Failed to load transactions';
            this.transactionsLoading = false;
          }
        },
        error: (err) => {
          this.transactionsError = 'An error occurred while fetching history';
          this.transactionsLoading = false;
          console.error('Transaction API Error:', err);
        }
      });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    if (this.selectedAccount) {
      this.loadTransactions(this.selectedAccount.id);
    }
  }

  onDeleteTransaction(transaction: any) {
    // Implement delete logic here
    console.log('Delete transaction:', transaction.id);
  }
}
