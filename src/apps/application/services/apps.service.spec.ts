import { AppsService } from './apps.service';

describe('AppsService', () => {
  let service: AppsService;

  beforeEach(() => {
    service = new AppsService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
