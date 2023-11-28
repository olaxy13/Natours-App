const express = require ("express"); 
const viewsController = require ("../controllers/viewsController");
const authController = require ("../controllers/authController")

const router = express.Router();   

router.use(authController.isLoggedIn);

//for rendering pages in the browser
router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour); //we use the slug to query for the tours  
router.get('/login', viewsController.getLoginForm);
// router.get('/tour', viewsController.getSignUpForm ) 
module.exports = router; 