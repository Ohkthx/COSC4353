const {
    api_get_history,
    api_get_price,
    get_history,
    get_quote,
    post_quote,
  } = require('./quote');

  const Quote = require('../models/quote');
  const { getToday } = require('../utils');
  
  describe('api_get_history', () => {
    test('should respond with 401 status when user is not authenticated', () => {
      // Mock database and request/response objects
      const mockDb = {
        get_history: jest.fn(),
      };
      const mockReq = {
        session: {
          user: {},
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the function to be tested
      api_get_history(mockDb, mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    test('should respond with history when user is authenticated', () => {
        // Mock database, request, and response objects
        const mockDb = {
          get_history: jest.fn().mockReturnValueOnce([]), 
        };
        const mockReq = {
          session: {
            user: {
              username: 'testuser', 
            },
          },
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        // Call the function to be tested
        api_get_history(mockDb, mockReq, mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith([]); 
      });
  });

  describe('api_get_price', () => {
    test('should respond with 401 status when user is not authenticated', () => {
      // Mock database and request/response objects
      const mockDb = {
        get_price: jest.fn(),
      };
      const mockReq = {
        session: {
          user: {},
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      // Call the function to be tested
      api_get_price(mockDb, mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    });

    test('should respond with price when user is authenticated', () => {
        // Mock database, request, and response objects
        const mockDb = {
          get_price: jest.fn().mockReturnValueOnce({ price: 10 }), 
        };
        const mockReq = {
          session: {
            user: {
              username: 'testuser', 
            },
          },
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
    
        // Call the function to be tested
        api_get_price(mockDb, mockReq, mockRes);
    
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ price: 10 }); 
      });
  });

  describe('get_history', () => {
    test('should send the HTML file when requested', () => {
      // Mock request and response objects
      const mockReq = {};
      const mockRes = {
        sendFile: jest.fn(),
      };
      const htmlPath = '../resources/quote/history'; 
  
      // Call the function to be tested
      get_history(mockReq, mockRes, htmlPath);
  
      expect(mockRes.sendFile).toHaveBeenCalledWith(htmlPath);
    });
  });

  describe('get_quote', () => {
    test('should send the HTML file when requested', () => {
      // Mock request and response objects
      const mockReq = {};
      const mockRes = {
        sendFile: jest.fn(),
      };
      const htmlPath = '../resources/quote/quote'; 
  
      // Call the function to be tested
      get_quote(mockReq, mockRes, htmlPath);
  
      expect(mockRes.sendFile).toHaveBeenCalledWith(htmlPath);
    });
  });

  describe('post_quote', () => {
    test('should respond with 400 status when user has not authenticated', () => {
      // Mock database, request, and response objects
      const mockDb = {
        get_user: jest.fn(),
        get_price: jest.fn(),
        get_history: jest.fn(),
        insert_quote: jest.fn(),
      };
      const mockReq = {
        session: {
          user: null,
        },
        body: {
          gallons: 100,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      };
  
      // Call the function to be tested
      post_quote(mockDb, mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User has not authenticated.' });
  
      expect(mockDb.insert_quote).not.toHaveBeenCalled();
    });
  
    test('should respond with 400 status and error message when gallons or price is invalid', () => {
      // Mock database, request, and response objects
      const mockDb = {
        get_user: jest.fn(),
        get_price: jest.fn().mockReturnValue({ price: 'invalid' }),
        get_history: jest.fn(),
        insert_quote: jest.fn(),
      };
      const mockReq = {
        session: {
          user: { username: 'testuser' },
        },
        body: {
          gallons: 'not a number',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        redirect: jest.fn(),
      };
  
      // Call the function to be tested
      post_quote(mockDb, mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid data provided.' });
  
      expect(mockDb.insert_quote).not.toHaveBeenCalled();
    });

    test('should insert a new quote into the database and redirect to /quote/history', () => {
        // Mock database, request, and response objects
        const mockDb = {
          get_user: jest.fn().mockReturnValue({ username: 'testuser', fullAddress: '123 Main St, Anytown, USA' }),
          get_price: jest.fn().mockReturnValue({ price: '1.50' }),
          get_history: jest.fn().mockReturnValue([]), 
          insert_quote: jest.fn(),
        };
        const mockReq = {
          session: {
            user: { username: 'testuser' },
          },
          body: {
            gallons: 100,
          },
        };
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          redirect: jest.fn(),
        };
    
        // Call the function to be tested
        post_quote(mockDb, mockReq, mockRes);
    
        expect(mockDb.insert_quote).toHaveBeenCalledWith(
          'testuser',
          expect.objectContaining({
            gallons: 100,
            address: '123 Main St, Anytown, USA',
            date: expect.any(String), 
            price: 1.50,
          })
        );
    
        expect(mockRes.redirect).toHaveBeenCalledWith('/quote/history');
      });
  });
  
  //This tests utils.js.
  const { checkAuth } = require('../utils');

  describe('checkAuth', () => {
    test('should call next() if user is authenticated', () => {
      const mockReq = { session: { user: { username: 'testuser' } } };
      const mockRes = {};
      const mockNext = jest.fn();
  
      checkAuth(mockReq, mockRes, mockNext);
  
      expect(mockNext).toHaveBeenCalled();
    });
  
    test('should redirect to login page if user is not authenticated', () => {
      const mockReq = { session: {} };
      const mockRes = { redirect: jest.fn() };
      const mockNext = jest.fn();
  
      checkAuth(mockReq, mockRes, mockNext);
  
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  //tests the quote.js file in the models folder(quote class)
  describe('Quote', () => {
    test('constructor should initialize quote properties', () => {
      const quote_id = 1;
      const gallons = 100;
      const address = '123 Main St';
      const date = '2022-03-31';
      const price = 2.5;
  
      const quote = new Quote(quote_id, gallons, address, date, price);
  
      expect(quote.quote_id).toEqual(quote_id);
      expect(quote.gallons).toEqual(gallons);
      expect(quote.address).toEqual(address);
      expect(quote.date).toEqual(date);
      expect(quote.price).toEqual(price);
    });
  
    test('cost getter should return the correct cost', () => {
      const quote_id = 1;
      const gallons = 100;
      const address = '123 Main St';
      const date = '2022-03-31';
      const price = 2.5;
  
      const quote = new Quote(quote_id, gallons, address, date, price);
  
      expect(quote.cost).toEqual(gallons * price);
    });
  });
