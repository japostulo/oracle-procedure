export default jest.fn().mockImplementation(() => ({
  createQueryRunner() {
    return {
      query: jest.fn(),
    };
  },
}));
