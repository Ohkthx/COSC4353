const {
  api_get_history,
  get_history,
  get_quote,
  post_quote,
} = require('./quote');

const Quote = require('../models/quote');

const dbMock = {
  get_user: jest.fn(),
  get_history: jest.fn(),
  get_history_total: jest.fn(),
  get_price: jest.fn(),
  insert_quote: jest.fn(),
};

const reqMock = {
  session: {
    user: {
      username: 'testuser',
    },
  },
};
const resMock = {
  status: jest.fn(() => resMock),
  json: jest.fn(),
  sendFile: jest.fn(),
  redirect: jest.fn(),
};

describe('api_get_history', () => {
  test('responds with user history', async () => {
    dbMock.get_history.mockResolvedValue([{ quoteId: 1, gallons: 100 }]);
    await api_get_history(dbMock, reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith([{ quoteId: 1, gallons: 100 }]);
  });

  test('handles not authenticated user', async () => {
    reqMock.session.user = {};
    await api_get_history(dbMock, reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
  });

  test('handles unable to obtain history', async () => {
    dbMock.get_history.mockResolvedValue(null);
    await api_get_history(dbMock, reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Unable to obtain history.' });
  });

  test('handles internal server error', async () => {
    dbMock.get_history.mockRejectedValue(new Error('Database error'));
    await api_get_history(dbMock, reqMock, resMock);
    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

describe('get_history', () => {
  test('sends the history HTML file', () => {
    const htmlPath = '../resources/quote/history.html';
    get_history(reqMock, resMock, htmlPath);
    expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
  });
});

describe('get_quote', () => {
  test('sends the quote HTML file', () => {
    const htmlPath = '../resources/quote/quote.html';
    get_quote(reqMock, resMock, htmlPath);
    expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
  });
});

describe('post_quote', () => {
  let reqMock;
  let resMock;
  let dbMock;

  beforeEach(() => {
    reqMock = {
      session: {
        user: {
          username: 'testuser',
          state: 'TX',
          fullAddress: '123 Main St'
        }
      },
      body: {
        gallons: '100'
      }
    };
    resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    dbMock = {
      get_user: jest.fn().mockResolvedValue({ username: 'testuser', state: 'TX', fullAddress: '123 Main St' }),
      get_history_total: jest.fn().mockResolvedValue(1),
      get_price: jest.fn().mockResolvedValue({ price: '1.50' }),
      insert_quote: jest.fn().mockResolvedValue()
    };
  });

  test('handles not authenticated user', async () => {
    const reqMock = {
      session: {
        user: {} 
      },
      body: {
        gallons: '100'
      }
    };
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn()
    };
    const dbMock = {
      get_user: jest.fn(),
      get_history_total: jest.fn().mockResolvedValue(1),
      get_price: jest.fn().mockResolvedValue({ price: '1.50' }),
      insert_quote: jest.fn().mockResolvedValue()
    };

    await post_quote(dbMock, reqMock, resMock);

    expect(dbMock.get_user).toHaveBeenCalled();

    expect(resMock.status).toHaveBeenCalledWith(401);
    
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
    
    expect(dbMock.insert_quote).not.toHaveBeenCalled();

    expect(resMock.redirect).not.toHaveBeenCalled();
  });
  

  test('handles invalid data provided', async () => {
    reqMock.body.gallons = 'invalid';

    await post_quote(dbMock, reqMock, resMock);

    expect(dbMock.get_user).toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Invalid data provided.' });
    expect(dbMock.insert_quote).not.toHaveBeenCalled();
    expect(resMock.redirect).not.toHaveBeenCalled();
  });

  test('handles database error', async () => {
    dbMock.get_user.mockRejectedValue(new Error('Database error'));

    await post_quote(dbMock, reqMock, resMock);

    expect(dbMock.get_user).toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(500);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    expect(dbMock.insert_quote).not.toHaveBeenCalled();
    expect(resMock.redirect).not.toHaveBeenCalled();
  });
});
