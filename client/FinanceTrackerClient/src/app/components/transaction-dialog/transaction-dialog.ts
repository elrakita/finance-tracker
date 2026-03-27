import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { CreateTransactionRequest, TRANSACTION_TYPE_OPTIONS } from '../../models/transaction';
import { Category } from '../../models/category';

@Component({
  selector: 'app-transaction-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './transaction-dialog.html',
  styleUrls: ['./transaction-dialog.scss']
})
export class TransactionDialogComponent implements OnInit {
  transactionForm: FormGroup;
  isLoading = false;
  transactionTypes = TRANSACTION_TYPE_OPTIONS; 
  errorMessage = '';
  successMessage = '';
  categories: Category[] = [];

  constructor(
    protected fb: FormBuilder,
    protected transactionService: TransactionService,
    protected categoryService: CategoryService,
    protected router: Router,
    private dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.transactionForm = this.fb.group({
      type: ['', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(-999999.99), Validators.max(999999.99)]],
      accountId: [this.data.accountId],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (res: any) => {
        if (res.success) this.categories = res.data;
      },
      error: (err: any) => this.errorMessage = "Could not load categories"
    });
  } 

  getErrorMessage(fieldName: string): string {
    const control = this.transactionForm.get(fieldName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('min')) return `Minimum amount is ${control.errors?.['min']?.min}`;
    if (control?.hasError('max')) return `Maximum amount is ${control.errors?.['max']?.max}`;
    return '';
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: CreateTransactionRequest = {
        type: parseInt(this.transactionForm.value.type),
        amount: parseFloat(this.transactionForm.value.amount),
        accountId: this.transactionForm.value.accountId,
        categoryId: this.transactionForm.value.categoryId
    };

    this.transactionService.createTransaction(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          setTimeout(() => this.dialogRef.close(true), 2000);
        } else {
          this.errorMessage = response.message + (response.errors?.length ? ': ' + response.errors.join(', ') : '');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.title || 'Failed to create transaction. Please try again.';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
