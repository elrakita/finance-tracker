import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-account-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './account-edit.html',
  styleUrl: './account-edit.scss'
})
export class AccountEditComponent {
  accountForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AccountEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initializing the form with existing data
    this.accountForm = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(3)]],
      balance: [data.balance, [Validators.required, Validators.min(0)]]
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
