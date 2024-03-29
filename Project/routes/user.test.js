const {
    api_get_user,
    get_user,
    get_update,
    post_update,
  } = require('./user');

const { User } = require('../models/user')
  
  const mockDb = {
    get_user: jest.fn(),
    update_user: jest.fn(),
  };
  
  const mockReq = {
    session: {
      user: {
        username: 'testuser',
      },
    },
    body: {
      fullname: 'Test User',
      address1: '123 Test St',
      city: 'Test City',
      zipcode: '12345',
      state: 'TX',
    },
  };
  
  const mockRes = {
    status: jest.fn(() => mockRes),
    json: jest.fn(),
    sendFile: jest.fn(),
    redirect: jest.fn(),
  };
  
  

    describe('api_get_user', () => {
        test('should respond with 401 status when user is not authenticated', () => {
        // Mock database and request/response objects
        const mockDb1 = {
            get_user: jest.fn()
        };
        const mockReq1 = {
            session: {
            user: {} 
            }
        };
        const mockRes1 = {
            status: jest.fn().mockReturnThis(), 
            json: jest.fn() 
        };
    
        // Call the function to be tested
        api_get_user(mockDb1, mockReq1, mockRes1);
    
        expect(mockRes1.status).toHaveBeenCalledWith(401);
        expect(mockRes1.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
        });
    });
  

    describe('user.js', () => {
        describe('get_user', () => {
          test('should send file when called with valid parameters', () => {
            // Mock response object
            const mockRes = {
              sendFile: jest.fn(),
            };
      
            // Call the function
            get_user({}, mockRes, 'user.js');
      
            expect(mockRes.sendFile).toHaveBeenCalledWith('user.js');
          });
        });
      
      });

    describe('get_update()', () => {
    test('should send file with correct path', () => {
        const html_path = '../public/resources/user/update'; 

        get_update(mockReq, mockRes, html_path);

        expect(mockRes.sendFile).toHaveBeenCalledWith(html_path);
        });
    });

    jest.mock('../models/user', () => {
        return jest.fn().mockImplementation(() => {
        return {
            
        };
        });
    });
  
    describe('post_update()', () => {
        test('should update user profile and redirect to /user', () => {
          mockDb.get_user.mockReturnValueOnce({ username: 'testuser' });
      
          post_update(mockDb, mockReq, mockRes);
      
          expect(mockDb.update_user).toHaveBeenCalledWith('testuser', expect.any(Object));
          expect(mockRes.redirect).toHaveBeenCalledWith('/user');
        });
      
        test('should respond with 400 status when user is not authenticated', () => {
          //Setting the session user to null to simulate unauthenticated user
          mockReq.session.user = null;
      
          post_update(mockDb, mockReq, mockRes);
      
          expect(mockRes.status).toHaveBeenCalledWith(400);
          expect(mockRes.json).toHaveBeenCalledWith({ error: 'User has not authenticated.' });
        });
      
        test('should respond with 400 status when required fields are missing', () => {
          mockReq.body = {};
          mockReq.body.zipcode = undefined;
      
          post_update(mockDb, mockReq, mockRes);
      
          expect(mockRes.status).toHaveBeenCalledWith(400);
        });
      
        test('should respond with 404 status when user profile not found', () => {
          mockReq.session = {};
          mockReq.session.user = {};
          mockReq.session.user.username = 'randomname';
          mockDb.get_user.mockReturnValueOnce(null);
      
          post_update(mockDb, mockReq, mockRes);
      
          expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });
