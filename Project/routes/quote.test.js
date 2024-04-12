const mongoose = require('mongoose');
const Quote = require('../models/quote');
const { checkAuth } = require('../utils');

const {
  api_get_history,
  api_get_price,
  get_history,
  get_quote,
  post_quote,
} = require('./quote');

const dbMock = {
  get_history: jest.fn(),
  get_price: jest.fn(),
  get_user: jest.fn(),
  insert_quote: jest.fn(),
};

const reqMock = {
  session: {
    user: {
      username: 'testUser',
    },
  },
  body: {},
};

const resMock = {
  status: jest.fn(() => resMock),
  json: jest.fn(),
  sendFile: jest.fn(),
  redirect: jest.fn(),
};

describe('api_get_history', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return "Not authenticated" error if user is not authenticated', async () => {
      const reqMock = {
        session: {
          user: {},
        },
      };
      const resMock = {
        status: jest.fn(() => resMock),
        json: jest.fn(),
      };
      const dbMock = {
        get_history: jest.fn(),
      };
  
      await api_get_history(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });
  
    it('should return history if user is authenticated', async () => {
      const username = 'testUser';
      const reqMock = {
        session: {
          user: { username },
        },
      };
      const resMock = {
        status: jest.fn(() => resMock),
        json: jest.fn(),
      };
      const historyData = [{ quote: 'quote1' }, { quote: 'quote2' }];
      const dbMock = {
        get_history: jest.fn().mockResolvedValue(historyData),
      };
  
      await api_get_history(dbMock, reqMock, resMock);
  
      expect(dbMock.get_history).toHaveBeenCalledWith(username);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith(historyData);
    });
  
    it('should return "Internal server error" if database operation fails', async () => {
      const reqMock = {
        session: {
          user: { username: 'testUser' },
        },
      };
      const resMock = {
        status: jest.fn(() => resMock),
        json: jest.fn(),
      };
      const dbMock = {
        get_history: jest.fn().mockRejectedValue('Database error'),
      };
  
      await api_get_history(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(500);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
  

describe('api_get_price', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return "Not authenticated" error if user is not authenticated', async () => {
      reqMock.session.user = {};
  
      await api_get_price(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
    });
  
    it('should return "Not authenticated" error if username is missing', async () => {
      reqMock.session.user.username = {};
  
      await api_get_price(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
    });
  
    it('should return "Internal server error" if get_price throws an error', async () => {
      dbMock.get_price.mockRejectedValueOnce('Database error');
  
      await api_get_price(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(500);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  
    it('should return "Internal server error" if get_user throws an error', async () => {
      dbMock.get_price.mockResolvedValueOnce(10); 
      dbMock.get_user.mockRejectedValueOnce('Database error');
  
      await api_get_price(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(500);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  
  
    it('should return price if user is authenticated and price is available', async () => {
      dbMock.get_price.mockResolvedValueOnce(10); 
      dbMock.get_user.mockResolvedValueOnce({});
  
      await api_get_price(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith(10);
    });
  });

  describe('get_history', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should send the history file if requested', () => {
      const reqMock = {};
      const resMock = {
        sendFile: jest.fn(),
      };
      const htmlPath = 'path/to/history.html';
  
      get_history(reqMock, resMock, htmlPath);
  
      expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
    });
  });

  describe('get_quote', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should send the quote file if requested', () => {
      const reqMock = {};
      const resMock = {
        sendFile: jest.fn(),
      };
      const htmlPath = 'path/to/quote.html';
  
      get_quote(reqMock, resMock, htmlPath);
  
      expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
    });
  });
  
  describe('post_quote', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return "Not authenticated." error if user is not authenticated', async () => {
      const reqMock = {
        session: {
          user: {
            username: {},
          },
        },
        body: {
          gallons: {},
        },
      };

      const resMock = {
        status: jest.fn(() => resMock),
        json: jest.fn(),
      };

      const dbMock = {
        get_user: jest.fn(),
      };
  
      await post_quote(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
    });
  
    it('should redirect to "/quote/history" after successful quote insertion', async () => {
      const reqMock = {
        session: {
          user: {
            username: 'testUser',
          },
        },
        body: {
          gallons: 100,
        },
      };
      const resMock = {
        redirect: jest.fn(),
      };
      const dbMock = {
        get_user: jest.fn().mockResolvedValue({}),
        get_price: jest.fn().mockResolvedValue({ price: 2.5 }),
        get_history: jest.fn().mockResolvedValue([]),
        insert_quote: jest.fn(),
      };
  
      await post_quote(dbMock, reqMock, resMock);
  
      expect(dbMock.insert_quote).toHaveBeenCalled();
      expect(resMock.redirect).toHaveBeenCalledWith('/quote/history');
    });
  });


  //testing utils.js
  describe('Quote Model', () => {
    beforeAll(async () => {
      // Connect to the MongoDB test database
      await mongoose.connect('mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
    });
  
    afterEach(async () => {
      await Quote.deleteMany({});
    });
  
    it('should create and save a new quote successfully', async () => {
      const quoteData = {
        username: 'testUser',
        quote_id: 1,
        gallons: 100,
        address: '123 Test St',
        date: new Date(),
        price: 2.5,
      };
  
      const newQuote = new Quote(quoteData);
      await newQuote.save();
  
      const savedQuote = await Quote.findOne({});
  
      expect(savedQuote.username).toEqual(quoteData.username);
      expect(savedQuote.quote_id).toEqual(quoteData.quote_id);
      expect(savedQuote.gallons).toEqual(quoteData.gallons);
      expect(savedQuote.address).toEqual(quoteData.address);
      expect(savedQuote.date).toEqual(quoteData.date);
      expect(savedQuote.price).toEqual(quoteData.price);
    });
  
    it('should calculate the cost correctly based on gallons and price', () => {
      const quoteData = {
        username: 'testUser',
        quote_id: 1,
        gallons: 100,
        address: '123 Test St',
        date: new Date(),
        price: 2.5,
      };
  
      const newQuote = new Quote(quoteData);

      const expectedCost = quoteData.gallons * quoteData.price;

      expect(newQuote.cost).toEqual(expectedCost);
    });
  });

  describe('checkAuth Function', () => {
    it('should call next() if user is authenticated', () => {
      const reqMock = {
        session: {
          user: { username: 'testUser' },
        },
      };
      const resMock = {};
      const nextMock = jest.fn();
  
      checkAuth(reqMock, resMock, nextMock);
  
      expect(nextMock).toHaveBeenCalled();
    });
  
    it('should redirect to "/login" if user is not authenticated', () => {
      const reqMock = {
        session: {
          user: null,
        },
      };
      const resMock = {
        redirect: jest.fn(),
      };
      const nextMock = jest.fn();
  
      checkAuth(reqMock, resMock, nextMock);
  
      expect(resMock.redirect).toHaveBeenCalledWith('/login');
      expect(nextMock).not.toHaveBeenCalled();
    });
  });
