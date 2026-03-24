import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule  } from '@angular/material/card';
import { AccountService } from '../../services/account.service';
import { ACCOUNT_TYPE_OPTIONS } from '../../models/account';

@Component({
  selector: 'app-account-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './account-dialog.html',
  styleUrl: './account-dialog.scss'
})
export class AccountDialogComponent {
  accountForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;
  accountTypes = ACCOUNT_TYPE_OPTIONS;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private dialogRef: MatDialogRef<AccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!(data && data.id);
    
    this.accountForm = this.fb.group({
      name: [data?.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      type: [data?.type || '', [Validators.required]],
      ...(!this.isEditMode && { 
        balance: [0, [Validators.required, Validators.min(-999999), Validators.max(999999)]] 
      })
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.accountForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    if (control.hasError('maxlength')) return `Maximum ${control.errors['maxlength'].requiredLength} characters exceeded`;
    if (control.hasError('min')) return `Value cannot be less than ${control.errors['min'].min}`;
    if (control.hasError('max')) return `Value cannot be more than ${control.errors['max'].max}`;

    return 'Invalid field';
  }


  onSubmit(): void {
    if (this.accountForm.invalid) return;

    this.isLoading = true;
    const request$ = this.isEditMode 
      ? this.accountService.updateAccount(this.data.id, this.accountForm.value)
      : this.accountService.createAccount(this.accountForm.value);

    request$.subscribe({
      next: (res) => {
        this.successMessage = res.message;
        setTimeout(() => this.dialogRef.close(true), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An error occurred';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
