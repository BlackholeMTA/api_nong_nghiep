import { BadRequestException } from '@nestjs/common';
import { MapFeaturesService } from './map-features.service';

describe('MapFeaturesService', () => {
  const service = new MapFeaturesService({} as never, {} as never, {} as never);

  it('rejects unsupported GeoJSON geometry types before persistence', async () => {
    await expect(
      service.create({
        type: 'Feature',
        geometry: {
          type: 'UnsupportedGeometry',
          coordinates: [106.2, 20.1],
        },
        properties: {
          lopBanDoId: '11111111-1111-4111-8111-111111111111',
          tieuDe: 'Test feature',
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
