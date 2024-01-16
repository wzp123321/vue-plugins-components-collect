import { EXCEPTION_INTERCEPTOR } from './exception-interceptor';
import { HEADER_INTERCEPTOR } from './header-interceptor';

export const INTERCEPTOR_PROVIDERS = [HEADER_INTERCEPTOR, EXCEPTION_INTERCEPTOR];
