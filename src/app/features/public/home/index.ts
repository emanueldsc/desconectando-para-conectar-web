/**
 * HomeModule (standalone barrel)
 *
 * Encapsula todos os componentes do domínio Home.
 * Em Angular 21, standalone components substituem NgModules.
 * Importe diretamente de 'features/public/home' para acessar os componentes.
 */
export { BlogPreviewComponent } from './components/blog-preview/blog-preview';
export { HeroComponent } from './components/hero/hero';
export { InstitutionCarouselComponent } from './components/institution-carousel/institution-carousel';
export { RifasDoBemComponent } from './components/rifas-do-bem/rifas-do-bem';
export { Home } from './home';

