import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { Account, AccountType } from '../../models/account';

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

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
        console.log('Accounts loaded:', data);
      },
      error: (error) => {
        this.error = 'Failed to load accounts';
        this.loading = false;
        console.error('Error loading accounts:', error);
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
}
