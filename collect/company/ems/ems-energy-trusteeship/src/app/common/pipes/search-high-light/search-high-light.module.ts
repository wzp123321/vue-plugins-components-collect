import { NgModule } from '@angular/core';
import { SearchHighLightPipe } from './search-high-light.pipe';

@NgModule({
  declarations: [SearchHighLightPipe],
  exports: [SearchHighLightPipe],
})
export class SearchHighLightModule {}
