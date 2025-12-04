import { Test, TestingModule } from '@nestjs/testing';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
