import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { Subscription } from 'rxjs';
import { CategoryDialogComponent } from '../category-dialog/category-dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();
  private dialog = inject(MatDialog);

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = "";

    this.subscription.add(
      this.categoryService.getCategories().subscribe({
        next: (response) => {
          if (response.success) {
            this.categories = response.data ?? [];
          } else {
            this.error = response.message;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load categories';
          this.loading = false;
          console.error(err);
        }
      })
    );
  }

  onCreate(): void {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }
  
  onEdit(account: any) {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: account,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }
  onDelete(category: any): void {
    if (!category || category.isDefault) {
      return;
    }

    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete category "${category.name}"? This cannot be undone.`
      },
      width: '400px'
    });

    confirmDialog.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }
      console.warn('Delete category is not implemented in API yet.');
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
