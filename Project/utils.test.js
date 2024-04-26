const { checkAuth, getToday } = require('./utils');

describe('checkAuth middleware', () => {
  test('calls next() if user is authenticated', () => {
    const req = { session: { user: { username: 'testuser' } } };
    const res = {};
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('redirects to login page if user is not authenticated', () => {
    const req = { session: {} };
    const res = { redirect: jest.fn() };
    const next = jest.fn();

    checkAuth(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});

describe('getToday function', () => {
  test('returns the current date in YYYY-MM-DD format', () => {
    const mockDate = new Date('2024-04-30T12:00:00Z');
    const realDate = Date;
    global.Date = class extends realDate {
      constructor() {
        super();
        return mockDate;
      }
    };

    const today = getToday();

    global.Date = realDate;

    expect(today).toBe('2024-04-30');
  });
});
