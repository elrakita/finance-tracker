import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountFormBase } from '../../abstracts/account-form-base';
import { AccountFormLayout } from '../../shared/components/account-form';

@Component({
  selector: 'app-create-account',
  imports: [CommonModule, ReactiveFormsModule, AccountFormLayout],
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss']
})
export class CreateAccountComponent extends AccountFormBase {
  protected override getName(): string {
    return AccountFormBase.CREATE_ACCOUNT_NAME;
  }
}
