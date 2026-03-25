import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './category-dialog.html',
  styleUrls: ['./category-dialog.scss']
})
export class CategoryDialogComponent {
  categoryForm: FormGroup;
  isEditMode: boolean;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  readonly presetColors = [
    '#5d4e37', '#8b7355', '#d2b48c', '#deb887',
    '#b85c5c', '#e67e22', '#f1c40f',
    '#27ae60', '#16a085', '#2980b9',
    '#8e44ad', '#2c3e50', '#7f8c8d'
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!(data && data.id);
    
    this.categoryForm = this.fb.group({
      name: [data?.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      icon: [data?.icon || '📁', [Validators.required]],
      color: [data?.color || '#4caf50', [Validators.required, Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')]]
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) return `Min ${control.errors['minlength'].requiredLength} characters`;
    if (control.hasError('maxlength')) return `Max ${control.errors['maxlength'].requiredLength} characters`;
    if (control.hasError('pattern')) return 'Invalid hex color';
    return 'Invalid field';
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;

    this.isLoading = true;
    const request$ = this.categoryService.createCategory(this.categoryForm.value);
    
    request$.subscribe({
      next: (res: any) => {
        this.successMessage = res.message;
        setTimeout(() => this.dialogRef.close(true), 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'An error occurred';
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
