import { NgModule } from '@angular/core';
import { OnlyAlphabetsDirective } from './only-alphabets.directive';
import { OnlyNumberDirective } from './only-number.directive';
import { OnlyAlphapetsNoSpaceDirective } from './only-alphapets-no-space.directive';


@NgModule({
  declarations: [
    OnlyNumberDirective,
    OnlyAlphabetsDirective,
    OnlyAlphapetsNoSpaceDirective,
  ],
  exports: [
    OnlyNumberDirective,
    OnlyAlphabetsDirective,
    OnlyAlphapetsNoSpaceDirective
  ]
})
export class CommonDirectivesModule { }
