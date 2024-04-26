const mongoose = require('mongoose');
const User = require('../models/user');

const {
    api_get_user,
    get_user,
    get_update,
    post_update,
  } = require('./user');
  
  describe('api_get_user', () => {
    test('returns user profile when authenticated', async () => {
      const username = 'testuser';
      const userMock = {
        username,
        fullname: 'Test User',
        address1: '123 Main St',
        city: 'Test City',
        zipcode: '12345',
        state: 'TX',
      };
      const dbMock = {
        get_user: jest.fn().mockResolvedValue(userMock),
      };
      const reqMock = {
        session: { user: { username } },
      };
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await api_get_user(dbMock, reqMock, resMock);
  
      expect(dbMock.get_user).toHaveBeenCalledWith(username);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith(userMock);
    });
  
    test('returns not authenticated error when user is not authenticated', async () => {
      const dbMock = {
        get_user: jest.fn(),
      };
      const reqMock = { session: { user: {} } };
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await api_get_user(dbMock, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
    });
  });

  describe('get_user', () => {
    test('sends user profile when authenticated', () => {
      const htmlPath = '../resources/user/user.html';
      const reqMock = {};
      const resMock = {
        sendFile: jest.fn(),
      };
  
      get_user(reqMock, resMock, htmlPath);
  
      expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
    });
  });
  
  describe('get_update', () => {
    test('sends update form when authenticated', () => {
      const htmlPath = '../resources/user/update.html';
      const reqMock = {};
      const resMock = {
        sendFile: jest.fn(),
      };
  
      get_update(reqMock, resMock, htmlPath);
  
      expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
    });
  });

  
  describe('post_update', () => {
    test('updates user profile and redirects when authenticated', async () => {
      const username = 'testuser';
      const reqBody = {
        fullname: 'Updated User',
        address1: '456 New St',
        city: 'New City',
        zipcode: '54321',
        state: 'NY',
      };
      const dbMock = {
        get_user: jest.fn().mockResolvedValue({ username }),
        update_user: jest.fn().mockResolvedValue(),
      };
      const reqMock = {
        session: { user: { username } },
        body: reqBody,
      };
      const resMock = {
        redirect: jest.fn(),
      };
  
      await post_update(dbMock, reqMock, resMock);
  
      expect(dbMock.get_user).toHaveBeenCalledWith(username);
      expect(dbMock.update_user).toHaveBeenCalledWith(username, reqBody);
      expect(resMock.redirect).toHaveBeenCalledWith('/user');
    });
  
  
    test('returns error when required fields are missing', async () => {
      const reqMock = {
        session: { user: { username: 'testuser' } },
        body: {},
      };
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
  
      await post_update({}, reqMock, resMock);
  
      expect(resMock.status).toHaveBeenCalledWith(400);
      expect(resMock.json).toHaveBeenCalledWith({ error: 'All fields are required except address2 and state.' });
    });

    test('returns error when user is not found in the database', async () => {
        const username = 'testuser';
        const reqBody = {
          fullname: 'Updated User',
          address1: '456 New St',
          city: 'New City',
          zipcode: '54321',
          state: 'NY',
        };
        const dbMock = {
          get_user: jest.fn().mockResolvedValue(null), 
          update_user: jest.fn().mockResolvedValue(),
        };
        const reqMock = {
          session: { user: { username } },
          body: reqBody,
        };
        const resMock = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
      
        await post_update(dbMock, reqMock, resMock);
      
        expect(dbMock.get_user).toHaveBeenCalledWith(username);
        expect(dbMock.update_user).not.toHaveBeenCalled();
        expect(resMock.status).toHaveBeenCalledWith(401);
        expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
      });
      
      
  });
