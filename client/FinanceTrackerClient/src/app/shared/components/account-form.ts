import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-form-layout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './account-form.html',
  styleUrl: './account-form.scss'
})
export class AccountFormLayout {
  @Input({ required: true }) accountForm!: FormGroup;
  @Input() successMessage: string | null = null;
  @Input() errorMessage: string | null = null;
  @Input() isLoading: boolean = false;
  
  @Output() onCancel = new EventEmitter<void>();
}