import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryListComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  private subscription: Subscription = new Subscription();

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
    // We'll implement the dialog next
    console.log('Opening create category modal...');
  }

  onDeleteCategory(category: any): void {
    console.log('Deleting category...');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
