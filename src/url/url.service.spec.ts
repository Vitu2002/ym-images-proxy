import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';

describe('UrlService', () => {
  let service: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlService],
    }).compile();

    service = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get error when unallowed url', async () => {
    await expect(
      service.validateImageUrl('https://reject.com/image.png'),
    ).rejects.toThrow();
  });

  it('should return a image buffer', async () => {
    const url = 'https://github.com/Vitu2002.png';
    
  })
});
