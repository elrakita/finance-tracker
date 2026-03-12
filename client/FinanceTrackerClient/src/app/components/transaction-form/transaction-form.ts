import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CreateTransactionRequest, Transaction, TRANSACTION_TYPE_OPTIONS } from '../../models/transaction';

@Component({
  selector: 'app-transaction-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './transaction-form.html'
})
export class TransactionFormComponent {
  transactionForm: FormGroup;
  isLoading = false;
  transactionTypes = TRANSACTION_TYPE_OPTIONS; 
  errorMessage = '';
  successMessage = '';
  success = false;

  constructor(
    protected fb: FormBuilder,
    protected transactionService: TransactionService,
    protected router: Router,
    private dialogRef: MatDialogRef<TransactionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const formData : any = {
      type: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(-999999.99), Validators.max(999999.99)]],
      accountId: [this.data.account?.id]
    }
    this.transactionForm = this.fb.group(formData);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transactionForm.controls).forEach(field => {
      const control = this.transactionForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.transactionForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
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
      case 'type': return 'Transaction type';
      case 'amount': return 'Amount';
      default: return fieldName;
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
        this.markFormGroupTouched();
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: CreateTransactionRequest = {
        type: parseInt(this.transactionForm.value.type),
        amount: parseFloat(this.transactionForm.value.amount),
        accountId: this.transactionForm.value.accountId
    };

      this.transactionService.createTransaction(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.success = true;
            this.successMessage = response.message;
            setTimeout(() => {
              this.dialogRef.close(true);
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
          this.errorMessage = 'Failed to create transaction. Please try again.';
          console.error('Error creating transaction:', error);
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/accounts']);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
