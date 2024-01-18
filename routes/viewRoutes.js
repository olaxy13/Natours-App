const express = require ("express"); 
const viewsController = require ("../controllers/viewsController");
const authController = require ("../controllers/authController")

const router = express.Router();   


//for rendering pages in the browser
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour); //we use the slug to query for the tours  
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
// router.get('/tour', viewsController.getSignUpForm ) ;

router.post('/submit-user-data', authController.protect, viewsController.updateUserData)

module.exports = router; 