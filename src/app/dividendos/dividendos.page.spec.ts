import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividendosPage } from './dividendos.page';

describe('DividendosPage', () => {
  let component: DividendosPage;
  let fixture: ComponentFixture<DividendosPage>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(DividendosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
