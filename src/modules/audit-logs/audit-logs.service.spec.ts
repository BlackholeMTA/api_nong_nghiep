import { BadRequestException } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';

describe('AuditLogsService', () => {
  const service = new AuditLogsService({} as never, {} as never);

  it('rejects invalid date ranges', () => {
    expect(() =>
      service.validateDateRange('2026-05-02T00:00:00Z', '2026-05-01T00:00:00Z'),
    ).toThrow(BadRequestException);
  });
});
