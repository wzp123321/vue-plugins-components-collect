import { FGetCryptoParams, FSetCookie } from '@/core/token';

const params = FGetCryptoParams('token', 'loginName', 'tocTenantId', 'realName');
FSetCookie('toc-token', params.token);
FSetCookie('username', params.loginName);
FSetCookie('realName', params.realName);
FSetCookie('toc_tenant_id', params.tocTenantId);
FSetCookie('toc', window.location.search.substring(1));
