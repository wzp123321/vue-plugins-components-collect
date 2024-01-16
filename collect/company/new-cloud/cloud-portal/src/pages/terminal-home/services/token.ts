import { FSetSession, FGetQueryParam } from '@/core/token';
import cryptoUtil from '@/utils/crypto';
FSetSession('tenant_code', cryptoUtil.Decrypt(FGetQueryParam('tenantCode') ?? ''));
FSetSession('tenant_id', cryptoUtil.Decrypt(FGetQueryParam('tenantId') ?? ''));
