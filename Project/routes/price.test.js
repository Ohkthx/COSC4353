const { api_post_price, get_price, calculate_margin} = require('./price');

const dbMock = {
  get_user: jest.fn(),
  get_price: jest.fn(),
  get_history_total: jest.fn(),
};

const reqMock = {
  session: {
    user: {
      username: 'testuser',
    },
  },
  body: {},
};
const resMock = {
  status: jest.fn(() => resMock),
  json: jest.fn(),
};

describe('api_post_price', () => {
  beforeEach(() => {
    reqMock.body = {
      gallonsRequested: '100',
      state: 'TX',
    };
  });

  test('responds with price and totalAmountDue', async () => {
    dbMock.get_user.mockResolvedValue({ state: 'TX' });
    dbMock.get_price.mockResolvedValue({ price: '1.50' });
    dbMock.get_history_total.mockResolvedValue(0);

    await api_post_price(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({
      price: '1.73',
      totalAmountDue: '172.50',
    });
  });

  test('handles not authenticated user', async () => {
    reqMock.session.user = null;

    await api_post_price(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
  });

  test('handles user not found', async () => {
    dbMock.get_user.mockResolvedValue(null);

    await api_post_price(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
  });

  test('handles internal server error', async () => {
    dbMock.get_user.mockRejectedValue(new Error('Database error'));

    await api_post_price(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
  });
});

describe('get_price', () => {
  test('calculates the price with margin correctly', () => {
    const price = 1.50;
    const gallons = 100;
    const state = 'TX';
    const history = 0;

    const result = get_price(price, gallons, state, history);

    expect(result).toBeCloseTo(1.725); 
  });
});

describe('calculate_margin', () => {
  test('calculates the margin correctly for TX state and history > 0, gallons <= 1000', () => {
    const price = 1.50;
    const gallons = 500;
    const state = 'TX';
    const history = 1;

    const result = calculate_margin(price, gallons, state, history);

    expect(result).toBeCloseTo(0.21); 
  });

  test('calculates the margin correctly for non-TX state, history = 0, gallons > 1000', () => {
    const price = 1.50;
    const gallons = 1500;
    const state = 'CA';
    const history = 0;

    const result = calculate_margin(price, gallons, state, history);

    expect(result).toBeCloseTo(0.24); 
  });

  
});
