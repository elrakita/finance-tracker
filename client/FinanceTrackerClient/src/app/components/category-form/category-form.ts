import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CreateCategoryRequest } from '../../models/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryFormComponent {
  categoryForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  success = false;
  readonly presetColors = [
    '#5d4e37', '#8b7355', '#d2b48c', '#deb887', // Browns/Tans
    '#b85c5c', '#e67e22', '#f1c40f',             // Reds/Oranges
    '#27ae60', '#16a085', '#2980b9',             // Greens/Blues
    '#8e44ad', '#2c3e50', '#7f8c8d'              // Purples/Greys
  ];

  constructor(
    protected fb: FormBuilder,
    protected categoryService: CategoryService,
    protected router: Router,
    private dialogRef: MatDialogRef<CategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      icon: ['📁', [Validators.required]],
      color: ['#4caf50', [Validators.required, Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')]]
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(field => {
      const control = this.categoryForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${control.errors?.['maxlength']?.requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      return `${this.getFieldDisplayName(fieldName)} must be a valid hex color`; 
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    switch (fieldName) {
      case 'name': return 'Category name';
      case 'icon': return 'Icon';
      case 'color': return 'Color';
      default: return fieldName;
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: CreateCategoryRequest = {
      name: this.categoryForm.value.name.trim(),
      icon: this.categoryForm.value.icon.trim(),
      color: this.categoryForm.value.color
    };

    this.categoryService.createCategory(request).subscribe({
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
        this.errorMessage = 'Failed to create category. Please try again.';
        console.error('Error creating category:', error);
      }
    });
  }

  isCustomColor(): boolean {
    const current = this.categoryForm.get('color')?.value;
    return current && !this.presetColors.includes(current);
  }

  onCancel(): void {
    this.router.navigate(['/categories']);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
