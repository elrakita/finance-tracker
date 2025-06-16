import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  navigateToCreate(): void {
    this.router.navigate(['/accounts/create']);
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
