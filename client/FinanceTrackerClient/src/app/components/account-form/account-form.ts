import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account, ACCOUNT_TYPE_OPTIONS } from '../../models/account';
import { ApiResponse } from '../../models/api-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-account-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './account-form.html',
  styleUrls: ['./account-form.scss']
})
export class AccountFormComponent {
  accountForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;
  accountTypes = ACCOUNT_TYPE_OPTIONS; 
  errorMessage = '';
  successMessage = '';
  success = false;

  constructor(
    protected fb: FormBuilder,
    protected accountService: AccountService,
    protected router: Router,
    private dialogRef: MatDialogRef<AccountFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initializing the form with existing data
    this.isEditMode = !!(this.data && this.data.id);
    const formData : any = {
      name: [this.isEditMode ? data.name : '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      type: [this.isEditMode ? data.type : '', [Validators.required]],
    }
    if (!this.isEditMode) {
      formData.balance = [0, [Validators.required, Validators.min(-999999.99), Validators.max(999999.99)]]
    }
    this.accountForm = this.fb.group(formData);
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

  onSubmit(): void {
    if (this.accountForm.invalid) {
        this.markFormGroupTouched();
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = {
        name: this.accountForm.value.name.trim(),
        type: parseInt(this.accountForm.value.type),
        balance: parseFloat(this.accountForm.value.balance)
    };

    // 1. Decide which request to send
    const request$ = this.isEditMode 
        ? this.accountService.updateAccount(this.data.id, formData) 
        : this.accountService.createAccount(formData);

    // 2. Subscribe once to handle both
    request$.subscribe({
        next: (response: ApiResponse<Account>) => {
        this.isLoading = false;
        if (response.success) {
            this.success = true;
            this.successMessage = response.message;
            setTimeout(() => this.dialogRef.close(true), 2000); // Close modal on success
        } else {
            this.errorMessage = response.message;
        }
        },
        error: (httpError: HttpErrorResponse) => { // Fixed with type!
        this.isLoading = false;
        this.errorMessage = httpError.error?.message || 'A server error occurred.';
        console.error('API Error:', httpError);
        }
    });
  }

  onCancel(): void {
    this.router.navigate(['/accounts']);
  }
  save(): void {
    if (this.accountForm.valid) {
      // Returns the new data back to the calling component
      this.dialogRef.close(this.accountForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
