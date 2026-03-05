import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../../services/account.service';
import { Account, AccountType } from '../../models/account';
import { AccountFormComponent } from '../account-form/account-form';


@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-list.html',
  styleUrl: './account-list.scss'
})
export class AccountListComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  error: string | null = null;
  private dialog = inject(MatDialog); 

  constructor(private accountService: AccountService, private router: Router) { }

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
    const dialogRef = this.dialog.open(AccountFormComponent, {
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
    const dialogRef = this.dialog.open(AccountFormComponent, {
      data: account,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 'result' contains the updated fields from the form
        console.log('Update this account in .NET:', account.id, result);
      }
    });
  }


}
