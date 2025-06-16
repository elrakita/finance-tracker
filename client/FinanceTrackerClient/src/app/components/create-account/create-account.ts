import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { CreateAccountRequest, AccountType, ACCOUNT_TYPE_OPTIONS } from '../../models/account';

@Component({
  selector: 'app-create-account',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss']
})
export class CreateAccountComponent implements OnInit {
  accountForm!: FormGroup;
  accountTypes = ACCOUNT_TYPE_OPTIONS;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.accountForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      type: ['', Validators.required],
      balance: [0, [
        Validators.required,
        Validators.min(-999999.99),
        Validators.max(999999.99)
      ]]
    });
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const request: CreateAccountRequest = {
        name: this.accountForm.value.name.trim(),
        type: parseInt(this.accountForm.value.type),
        balance: parseFloat(this.accountForm.value.balance)
      };

      this.accountService.createAccount(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.success = true;
            this.successMessage = response.message;
            setTimeout(() => {
              this.router.navigate(['/accounts']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
            if (response.errors && response.errors.length > 0) {
              this.errorMessage += ': ' + response.errors.join(', ');
            }
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create account. Please try again.';
          console.error('Error creating account:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.accountForm.controls).forEach(field => {
      const control = this.accountForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.accountForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${control.errors?.['maxlength']?.requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldDisplayName(fieldName)} cannot be less than ${control.errors?.['min']?.min}`;
    }
    if (control?.hasError('max')) {
      return `${this.getFieldDisplayName(fieldName)} cannot be more than ${control.errors?.['max']?.max}`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    switch (fieldName) {
      case 'name': return 'Account name';
      case 'type': return 'Account type';
      case 'balance': return 'Balance';
      default: return fieldName;
    }
  }

  onCancel(): void {
    this.router.navigate(['/accounts']);
  }
}
