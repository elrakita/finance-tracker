import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AccountFormBase } from '../../abstracts/account-form-base';
import { AccountFormLayout } from '../../shared/components/account-form';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'account-form-container',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, AccountFormLayout],
  templateUrl: './account-edit.html',
  styleUrl: './account-edit.scss'
})
export class AccountEditComponent extends AccountFormBase {
  protected override getName(): string {
    throw new Error('Method not implemented.');
  }
  constructor(
     fb: FormBuilder,
     accountService: AccountService,
     router: Router,
    private dialogRef: MatDialogRef<AccountEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(fb, accountService, router);
  }

  protected override createForm(): void {
    this.accountForm = this.fb.group({
      name: [this.data.name, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      type: [this.data.type, Validators.required],
      balance: [this.data.balance, [
        Validators.required,
        Validators.min(-999999.99),
        Validators.max(999999.99)
      ]]
    });
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
