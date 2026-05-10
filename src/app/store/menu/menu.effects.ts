import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { MenuService } from '../../shared/services/menu.service';
import { MenuActions } from './menu.actions';

@Injectable()
export class MenuEffects {
  private readonly actions$ = inject(Actions);
  private readonly menuService = inject(MenuService);

  public readonly loadMenu$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuActions.loadMenu),
      switchMap(({ profile }) =>
        this.menuService.getMenuByProfile(profile).pipe(
          map((menuItems) => MenuActions.loadMenuSuccess({ menuItems, profile })),
          catchError((error: unknown) => {
            const message = error instanceof Error ? error.message : 'Falha ao carregar menu';
            return of(MenuActions.loadMenuFailure({ error: message }));
          })
        )
      )
    )
  );
}
